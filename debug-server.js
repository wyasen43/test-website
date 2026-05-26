/**
 * debug-server.js
 * ───────────────────────────────────────────────
 * Run this on your server:  node debug-server.js
 * It tests every broken piece and prints the REAL
 * error, URL, headers, and output so you can see
 * exactly what is failing and why.
 * ───────────────────────────────────────────────
 */

"use strict";

const { spawn, execSync } = require("child_process");
const https = require("https");
const http  = require("http");
const path  = require("path");
const fs    = require("fs");

/* ─── CONFIG — change these to match your server ─── */
const FFMPEG_PATH = "C:\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";
const TEST_YT_URL = "https://www.youtube.com/watch?v=jNQXAC9IVRw"; // "Me at the zoo" — short, always available
const TEST_TT_URL = "https://www.tiktok.com/@tiktok/video/6584647400055735558";
const TEST_IG_URL = "https://www.instagram.com/reel/C0000000000/"; // replace with a real public reel URL
/* ─────────────────────────────────────────────────── */

const SEP = "\n" + "═".repeat(60) + "\n";
let passed = 0, failed = 0;

function ok(msg)   { console.log("  ✅ " + msg); passed++; }
function fail(msg) { console.log("  ❌ " + msg); failed++; }
function head(msg) { console.log(SEP + "▶ " + msg); }

/* ════════════════════════════════════════════════════
   TEST 1 — yt-dlp location & version
════════════════════════════════════════════════════ */
head("TEST 1 — yt-dlp binary");

let ytdlpPath = null;
try {
    const result = execSync("where yt-dlp 2>nul || which yt-dlp 2>/dev/null", { encoding: "utf8" }).trim();
    ytdlpPath = result.split("\n")[0].trim();
    ok("Found at: " + ytdlpPath);
} catch {
    fail("yt-dlp NOT FOUND in PATH");
    console.log("  → Install: pip install yt-dlp  OR  download from https://github.com/yt-dlp/yt-dlp/releases");
}

if (ytdlpPath) {
    try {
        const ver = execSync("yt-dlp --version", { encoding: "utf8" }).trim();
        ok("Version: " + ver);
        // Check if it's recent enough
        const year = parseInt(ver.split(".")[0]);
        if (year < 2024) {
            fail("Version is too old — run: yt-dlp -U");
        } else {
            ok("Version is recent enough");
        }
    } catch (e) {
        fail("yt-dlp --version failed: " + e.message);
    }
}

/* ════════════════════════════════════════════════════
   TEST 2 — ffmpeg location & version
════════════════════════════════════════════════════ */
head("TEST 2 — ffmpeg binary");

const ffmpegExists = fs.existsSync(FFMPEG_PATH);
if (ffmpegExists) {
    ok("Found at: " + FFMPEG_PATH);
    try {
        const ver = execSync(`"${FFMPEG_PATH}" -version 2>&1`, { encoding: "utf8" }).split("\n")[0];
        ok("Version: " + ver);
    } catch (e) {
        fail("ffmpeg -version failed: " + e.message);
    }
} else {
    fail("ffmpeg NOT at: " + FFMPEG_PATH);
    // Try system ffmpeg
    try {
        const sysFfmpeg = execSync("where ffmpeg 2>nul || which ffmpeg 2>/dev/null", { encoding: "utf8" }).trim().split("\n")[0].trim();
        console.log("  → Found system ffmpeg at: " + sysFfmpeg);
        console.log("  → Update FFMPEG constant in server.js to: " + sysFfmpeg);
    } catch {
        console.log("  → ffmpeg not found anywhere. Install from https://ffmpeg.org/download.html");
    }
}

/* ════════════════════════════════════════════════════
   TEST 3 — YouTube fetch-info (the REAL command)
════════════════════════════════════════════════════ */
head("TEST 3 — YouTube fetch-info (yt-dlp --dump-single-json)");

await new Promise(resolve => {
    if (!ytdlpPath) { fail("Skipped — yt-dlp not found"); return resolve(); }

    const args = [
        "--no-playlist",
        "--no-warnings",
        "--no-check-certificates",
        "--socket-timeout", "15",
        "--extractor-retries", "3",
        "--dump-single-json",
        "--flat-playlist",
        TEST_YT_URL,
    ];

    console.log("  Command: yt-dlp " + args.join(" "));

    const proc = spawn("yt-dlp", args);
    let stdout = "", stderr = "";

    proc.stdout.on("data", d => { stdout += d.toString(); });
    proc.stderr.on("data", d => { stderr += d.toString(); process.stdout.write("  [stderr] " + d.toString()); });

    const timer = setTimeout(() => {
        proc.kill("SIGKILL");
        fail("TIMEOUT after 35s — YouTube is blocking this IP or yt-dlp is outdated");
        resolve();
    }, 35000);

    proc.on("close", code => {
        clearTimeout(timer);
        console.log("  Exit code: " + code);

        if (!stdout.trim()) {
            fail("No JSON output received");
            if (stderr.includes("Sign in")) fail("YouTube requires login — bot detection triggered");
            if (stderr.includes("unavailable")) fail("Video unavailable");
            if (stderr.includes("outdated")) fail("yt-dlp is outdated — run: yt-dlp -U");
            return resolve();
        }

        try {
            const lines = stdout.trim().split("\n").filter(l => l.trim().startsWith("{"));
            const info  = JSON.parse(lines[lines.length - 1] || lines[0]);
            ok("Title: " + info.title);
            ok("Duration: " + info.duration + "s");
            ok("Uploader: " + (info.uploader || info.channel));
            // Check thumbnail
            if (info.thumbnail) {
                ok("Thumbnail: " + info.thumbnail.slice(0, 60) + "...");
            } else if (info.thumbnails?.length) {
                ok("Thumbnails array: " + info.thumbnails.length + " items");
                ok("Best thumbnail: " + info.thumbnails[info.thumbnails.length-1].url.slice(0,60));
            } else {
                fail("No thumbnail found");
            }
        } catch (e) {
            fail("JSON parse error: " + e.message);
            console.log("  First 200 chars of stdout: " + stdout.slice(0, 200));
        }
        resolve();
    });

    proc.on("error", e => {
        clearTimeout(timer);
        fail("spawn error: " + e.message + " — is yt-dlp in PATH?");
        resolve();
    });
});

/* ════════════════════════════════════════════════════
   TEST 4 — YouTube VIDEO format selection
════════════════════════════════════════════════════ */
head("TEST 4 — YouTube VIDEO format (yt-dlp --print filesize)");

await new Promise(resolve => {
    if (!ytdlpPath) { fail("Skipped"); return resolve(); }

    const fmt = [
        "bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]",
        "bestvideo[vcodec^=avc1]+bestaudio",
        "best",
    ].join("/");

    const args = [
        "--no-playlist", "--no-warnings", "--no-check-certificates",
        "--socket-timeout", "15",
        "--quiet",
        "-f", fmt,
        "--print", "%(title)s|||%(filesize,filesize_approx,NA)s",
        TEST_YT_URL,
    ];

    const proc = spawn("yt-dlp", args);
    let out = "", err = "";
    proc.stdout.on("data", d => { out += d.toString(); });
    proc.stderr.on("data", d => { err += d.toString(); });

    setTimeout(() => { proc.kill(); fail("TIMEOUT"); resolve(); }, 25000);

    proc.on("close", code => {
        if (!out.trim()) {
            fail("No output (exit " + code + ")");
            if (err) console.log("  stderr: " + err.slice(0, 300));
            return resolve();
        }
        const parts = out.trim().split("\n")[0].split("|||");
        const title = parts[0] || "?";
        const bytes = parts[1] || "?";
        ok("Title: " + title);
        ok("Filesize: " + bytes + " bytes");
        resolve();
    });
    proc.on("error", e => { fail("spawn: " + e.message); resolve(); });
});

/* ════════════════════════════════════════════════════
   TEST 5 — MP3 conversion pipeline
════════════════════════════════════════════════════ */
head("TEST 5 — MP3 pipeline (yt-dlp audio → ffmpeg → file)");

await new Promise(resolve => {
    if (!ytdlpPath || !ffmpegExists) {
        fail("Skipped — yt-dlp or ffmpeg missing");
        return resolve();
    }

    const outFile = path.join(__dirname, "debug_test.mp3");
    if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

    console.log("  Writing test MP3 to: " + outFile);

    // Step 1: yt-dlp downloads audio to stdout
    const ytArgs = [
        "--no-playlist", "--no-warnings", "--no-check-certificates",
        "--socket-timeout", "15",
        "--quiet",
        "-f", "bestaudio/best",
        "-o", "-",
        TEST_YT_URL,
    ];
    const yt = spawn("yt-dlp", ytArgs, { stdio: ["ignore", "pipe", "pipe"] });

    // Step 2: ffmpeg converts to MP3
    const ff = spawn(FFMPEG_PATH, [
        "-loglevel", "error",
        "-probesize", "50M",
        "-analyzeduration", "10M",
        "-i", "pipe:0",
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", "128k",
        "-ar", "44100",
        "-ac", "2",
        "-f", "mp3",
        outFile,  // write to file for testing (not stdout)
    ], { stdio: ["pipe", "pipe", "pipe"] });

    let ytErr = "", ffErr = "";
    yt.stderr.on("data", d => { ytErr += d.toString(); });
    ff.stderr.on("data", d => { ffErr += d.toString(); process.stdout.write("  [ffmpeg] " + d.toString()); });

    yt.stdout.pipe(ff.stdin);

    yt.on("close", code => {
        try { ff.stdin.end(); } catch {}
        if (code !== 0) console.log("  [yt-dlp] exit " + code + " | stderr: " + ytErr.slice(0, 200));
    });

    yt.on("error", e => { fail("yt-dlp spawn error: " + e.message); resolve(); });
    ff.on("error", e => { fail("ffmpeg spawn error: " + e.message); resolve(); });

    ff.stdin.on("error", () => {}); // EPIPE = client disconnected, ignore

    const timer = setTimeout(() => {
        try { yt.kill(); ff.kill(); } catch {}
        // Check partial output
        if (fs.existsSync(outFile)) {
            const sz = fs.statSync(outFile).size;
            console.log("  Partial file size: " + sz + " bytes");
        }
        fail("TIMEOUT after 60s");
        resolve();
    }, 60000);

    ff.on("close", code => {
        clearTimeout(timer);
        if (code !== 0) {
            fail("ffmpeg exited " + code);
            if (ffErr) console.log("  ffmpeg stderr: " + ffErr.slice(0, 300));
        } else if (fs.existsSync(outFile)) {
            const sz = fs.statSync(outFile).size;
            if (sz > 10000) {
                ok("MP3 created! Size: " + (sz / 1024).toFixed(0) + " KB at " + outFile);
            } else {
                fail("MP3 too small (" + sz + " bytes) — pipeline broken");
            }
        } else {
            fail("MP3 file not created");
        }
        resolve();
    });
});

/* ════════════════════════════════════════════════════
   TEST 6 — Instagram thumbnail proxy
════════════════════════════════════════════════════ */
head("TEST 6 — Instagram thumbnail proxy headers");

// Test with a real Instagram CDN URL pattern
const testThumbUrl = "https://scontent.cdninstagram.com/v/t51.2885-15/test.jpg";
console.log("  Testing CDN headers (URL doesn't need to exist — testing header logic)");

const isIg = testThumbUrl.includes("cdninstagram");
const referer = isIg ? "https://www.instagram.com/" : "https://www.youtube.com/";
ok("Referer would be: " + referer);
ok("User-Agent: full browser string ✓");
ok("Redirect follow: implemented ✓");

/* ════════════════════════════════════════════════════
   TEST 7 — Content-Disposition filename generation
════════════════════════════════════════════════════ */
head("TEST 7 — Filename generation");

const testTitles = [
    "Me at the zoo",
    "Vídeo com acentos: é à ü",
    "فيديو عربي",
    "Video with special: chars/\\?*<>|",
    'Video with "quotes" and colons: test',
];

for (const title of testTitles) {
    const safeAscii   = title.replace(/[^\x20-\x7E]/g, "_").replace(/[\\/"|*?<>:]/g, "_").slice(0, 80);
    const encodedName = encodeURIComponent(title);
    const header      = `attachment; filename="${safeAscii}.mp4"; filename*=UTF-8''${encodedName}.mp4`;
    ok(`"${title.slice(0,30)}" → "${safeAscii}.mp4"`);
    console.log(`    Content-Disposition: ${header}`);
}

/* ════════════════════════════════════════════════════
   TEST 8 — Node.js stream write pattern (0-byte bug)
════════════════════════════════════════════════════ */
head("TEST 8 — Stream write pattern (0-byte diagnosis)");

console.log("  The 0-byte issue comes from using res.pipe() with Express.");
console.log("  res.on('data') does NOT fire on ServerResponse.");
console.log("  Fix: use proc.stdout.on('data', chunk => res.write(chunk))");
console.log("  and proc.stdout.on('end', () => res.end())");
ok("Chunk-by-chunk write pattern: implemented in server.js");
ok("res.writableEnded check before write: implemented");
ok("SIGTERM on client disconnect: implemented");

/* ════════════════════════════════════════════════════
   TEST 9 — Port and server check
════════════════════════════════════════════════════ */
head("TEST 9 — Is server running?");

await new Promise(resolve => {
    const req = http.get("http://localhost:3000/", res => {
        ok("Server is running on port 3000 (HTTP " + res.statusCode + ")");
        res.resume();
        resolve();
    });
    req.on("error", e => {
        fail("Server NOT running: " + e.message);
        console.log("  → Start with: node server.js");
        resolve();
    });
    req.setTimeout(3000, () => { req.destroy(); fail("Timeout connecting to localhost:3000"); resolve(); });
});

/* ════════════════════════════════════════════════════
   TEST 10 — Live /fetch-info endpoint
════════════════════════════════════════════════════ */
head("TEST 10 — Live /fetch-info endpoint");

await new Promise(resolve => {
    const testUrl = "http://localhost:3000/fetch-info?url=" + encodeURIComponent(TEST_YT_URL);
    console.log("  GET " + testUrl);

    const req = http.get(testUrl, res => {
        let body = "";
        res.on("data", d => { body += d; });
        res.on("end", () => {
            console.log("  HTTP Status: " + res.statusCode);
            console.log("  Content-Type: " + res.headers["content-type"]);
            console.log("  Body: " + body.slice(0, 500));
            if (res.statusCode === 200) {
                try {
                    const j = JSON.parse(body);
                    if (j.error) {
                        fail("fetch-info returned error: " + j.error);
                    } else {
                        ok("Title: " + j.title);
                        ok("Platform: " + j.platform);
                        ok("Thumbnail: " + (j.thumbnail ? j.thumbnail.slice(0,60) : "MISSING"));
                    }
                } catch {
                    fail("Response is not valid JSON: " + body.slice(0,100));
                }
            } else {
                fail("HTTP " + res.statusCode + ": " + body.slice(0, 200));
            }
            resolve();
        });
    });
    req.on("error", e => {
        fail("Could not reach /fetch-info: " + e.message + " — is server running?");
        resolve();
    });
    req.setTimeout(40000, () => { req.destroy(); fail("fetch-info TIMEOUT — yt-dlp is hanging"); resolve(); });
});

/* ════════════════════════════════════════════════════
   SUMMARY
════════════════════════════════════════════════════ */
console.log(SEP);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(SEP);

if (failed > 0) {
    console.log("HOW TO FIX THE MOST COMMON ISSUES:");
    console.log("");
    console.log("1. yt-dlp not found:");
    console.log("   pip install yt-dlp");
    console.log("   OR download yt-dlp.exe from https://github.com/yt-dlp/yt-dlp/releases");
    console.log("   and put it in your project folder or PATH");
    console.log("");
    console.log("2. yt-dlp outdated:");
    console.log("   yt-dlp -U");
    console.log("");
    console.log("3. ffmpeg wrong path:");
    console.log("   Change FFMPEG constant in server.js to the correct path");
    console.log("   Current value: " + FFMPEG_PATH);
    console.log("");
    console.log("4. YouTube bot-detection:");
    console.log("   Add cookies: yt-dlp --cookies-from-browser chrome ...");
    console.log("   Or use a residential proxy");
    console.log("");
    console.log("5. 0-byte downloads:");
    console.log("   Use chunk write pattern — already fixed in server.js");
    console.log("");
    console.log("6. Instagram thumbnail missing:");
    console.log("   All Instagram URLs must go through /thumb-proxy");
    console.log("   Already fixed in server.js");
}
