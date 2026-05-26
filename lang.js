/* ================================================
   lang.js — Shared i18n system for all pages
   ================================================ */

const LANGS = {
  en:  { flag:'🇺🇸', name:'English',     dir:'ltr' },
  ar:  { flag:'🇸🇦', name:'العربية',     dir:'rtl' },
  es:  { flag:'🇪🇸', name:'Español',     dir:'ltr' },
  pt:  { flag:'🇧🇷', name:'Português',   dir:'ltr' },
  id:  { flag:'🇮🇩', name:'Indonesia',   dir:'ltr' },
  fr:  { flag:'🇫🇷', name:'Français',    dir:'ltr' },
  de:  { flag:'🇩🇪', name:'Deutsch',     dir:'ltr' },
  ja:  { flag:'🇯🇵', name:'日本語',       dir:'ltr' },
  tr:  { flag:'🇹🇷', name:'Türkçe',      dir:'ltr' },
  ru:  { flag:'🇷🇺', name:'Русский',     dir:'ltr' },
  hi:  { flag:'🇮🇳', name:'हिन्दी',      dir:'ltr' },
  vi:  { flag:'🇻🇳', name:'Tiếng Việt',  dir:'ltr' },
  th:  { flag:'🇹🇭', name:'ภาษาไทย',    dir:'ltr' },
  it:  { flag:'🇮🇹', name:'Italiano',    dir:'ltr' },
  ko:  { flag:'🇰🇷', name:'한국어',       dir:'ltr' },
  fil: { flag:'🇵🇭', name:'Filipino',    dir:'ltr' },
  pl:  { flag:'🇵🇱', name:'Polski',      dir:'ltr' },
  nl:  { flag:'🇳🇱', name:'Nederlands',  dir:'ltr' },
  zh:  { flag:'🇨🇳', name:'中文',         dir:'ltr' },
  uk:  { flag:'🇺🇦', name:'Українська',  dir:'ltr' },
};

const TRANSLATIONS = {
  /* ── NAV ── */
  nav_howto:    { en:'How to Use', ar:'طريقة الاستخدام', es:'Cómo usar', pt:'Como usar', id:'Cara Pakai', fr:'Comment utiliser', de:'Anleitung', ja:'使い方', tr:'Nasıl kullanılır', ru:'Как пользоваться', hi:'कैसे उपयोग करें', vi:'Cách sử dụng', th:'วิธีใช้', it:'Come usare', ko:'사용 방법', fil:'Paano gamitin', pl:'Jak używać', nl:'Hoe te gebruiken', zh:'使用方法', uk:'Як користуватись' },
  nav_faq:      { en:'FAQ', ar:'الأسئلة الشائعة', es:'Preguntas frecuentes', pt:'Perguntas frequentes', id:'FAQ', fr:'FAQ', de:'FAQ', ja:'よくある質問', tr:'SSS', ru:'FAQ', hi:'FAQ', vi:'FAQ', th:'FAQ', it:'FAQ', ko:'FAQ', fil:'FAQ', pl:'FAQ', nl:'FAQ', zh:'常见问题', uk:'FAQ' },
  nav_home:     { en:'Home', ar:'الرئيسية', es:'Inicio', pt:'Início', id:'Beranda', fr:'Accueil', de:'Startseite', ja:'ホーム', tr:'Ana Sayfa', ru:'Главная', hi:'होम', vi:'Trang chủ', th:'หน้าหลัก', it:'Home', ko:'홈', fil:'Home', pl:'Strona główna', nl:'Home', zh:'首页', uk:'Головна' },
  download_now: { en:'Download Now', ar:'حمّل الآن', es:'Descargar ahora', pt:'Baixar agora', id:'Unduh sekarang', fr:'Télécharger', de:'Jetzt herunterladen', ja:'今すぐダウンロード', tr:'Şimdi İndir', ru:'Скачать', hi:'अभी डाउनलोड करें', vi:'Tải ngay', th:'ดาวน์โหลดเลย', it:'Scarica ora', ko:'지금 다운로드', fil:'I-download na', pl:'Pobierz teraz', nl:'Nu downloaden', zh:'立即下载', uk:'Завантажити' },

  /* ── INDEX ── */
  badge:        { en:'Free · Fast · No Registration', ar:'مجاني · سريع · بدون تسجيل', es:'Gratis · Rápido · Sin registro', pt:'Grátis · Rápido · Sem cadastro', id:'Gratis · Cepat · Tanpa Daftar', fr:'Gratuit · Rapide · Sans inscription', de:'Kostenlos · Schnell · Ohne Anmeldung', ja:'無料 · 高速 · 登録不要', tr:'Ücretsiz · Hızlı · Kayıt Yok', ru:'Бесплатно · Быстро · Без регистрации', hi:'मुफ्त · तेज़ · बिना पंजीकरण', vi:'Miễn phí · Nhanh · Không đăng ký', th:'ฟรี · เร็ว · ไม่ต้องสมัคร', it:'Gratis · Veloce · Senza registrazione', ko:'무료 · 빠름 · 가입 불필요', fil:'Libre · Mabilis · Walang Pagpaparehistro', pl:'Bezpłatny · Szybki · Bez rejestracji', nl:'Gratis · Snel · Zonder registratie', zh:'免费 · 快速 · 无需注册', uk:'Безкоштовно · Швидко · Без реєстрації' },
  h1_line1:     { en:'Download Any Video', ar:'حمّل أي فيديو', es:'Descarga Cualquier Video', pt:'Baixe Qualquer Vídeo', id:'Unduh Video Apapun', fr:'Téléchargez N\'importe Quelle Vidéo', de:'Lade Jedes Video herunter', ja:'あらゆる動画をダウンロード', tr:'Her Videoyu İndir', ru:'Скачайте Любое Видео', hi:'कोई भी वीडियो डाउनलोड करें', vi:'Tải Xuống Bất Kỳ Video', th:'ดาวน์โหลดวิดีโอใดก็ได้', it:'Scarica Qualsiasi Video', ko:'모든 동영상 다운로드', fil:'I-download ang Anumang Video', pl:'Pobierz Dowolne Wideo', nl:'Download Elke Video', zh:'下载任何视频', uk:'Завантажте Будь-яке Відео' },
  h1_line2:     { en:'or Audio', ar:'أو صوت', es:'o Audio', pt:'ou Áudio', id:'atau Audio', fr:'ou Audio', de:'oder Audio', ja:'または音声', tr:'veya Ses', ru:'или Аудио', hi:'या ऑडियो', vi:'hoặc Âm thanh', th:'หรือเสียง', it:'o Audio', ko:'또는 오디오', fil:'o Audio', pl:'lub Audio', nl:'of Audio', zh:'或音频', uk:'або Аудіо' },
  hero_sub:     { en:'Paste a link from any platform and get your file in seconds.', ar:'الصق رابطاً من أي منصة واحصل على ملفك في ثوانٍ.', es:'Pega un enlace de cualquier plataforma y obtén tu archivo en segundos.', pt:'Cole um link de qualquer plataforma e obtenha seu arquivo em segundos.', id:'Tempel tautan dari platform mana saja dan dapatkan file dalam hitungan detik.', fr:'Collez un lien depuis n\'importe quelle plateforme et obtenez votre fichier en secondes.', de:'Füge einen Link ein und erhalte deine Datei in Sekunden.', ja:'任意のプラットフォームのリンクを貼り付けて、数秒でファイルを取得。', tr:'Herhangi bir platformdan bağlantı yapıştır ve dosyanı saniyeler içinde al.', ru:'Вставьте ссылку с любой платформы и получите файл за секунды.', hi:'किसी भी प्लेटफ़ॉर्म से लिंक पेस्ट करें और सेकंड में फ़ाइल पाएं।', vi:'Dán liên kết từ bất kỳ nền tảng nào và nhận tệp trong vài giây.', th:'วางลิงก์จากแพลตฟอร์มใดก็ได้ แล้วรับไฟล์ภายในไม่กี่วินาที', it:'Incolla un link da qualsiasi piattaforma e ottieni il tuo file in pochi secondi.', ko:'모든 플랫폼의 링크를 붙여넣고 몇 초 만에 파일을 받으세요.', fil:'I-paste ang link mula sa anumang platform at makuha ang iyong file sa ilang segundo.', pl:'Wklej link z dowolnej platformy i pobierz plik w kilka sekund.', nl:'Plak een link van elk platform en ontvang je bestand in seconden.', zh:'粘贴任意平台的链接，几秒钟内获取您的文件。', uk:'Вставте посилання з будь-якої платформи та отримайте файл за секунди.' },
  input_ph:     { en:'Paste video URL here...', ar:'الصق رابط الفيديو هنا...', es:'Pega la URL del video aquí...', pt:'Cole a URL do vídeo aqui...', id:'Tempel URL video di sini...', fr:'Collez l\'URL de la vidéo ici...', de:'Video-URL hier einfügen...', ja:'動画URLをここに貼り付け...', tr:'Video URL\'sini buraya yapıştır...', ru:'Вставьте URL видео сюда...', hi:'यहाँ वीडियो URL पेस्ट करें...', vi:'Dán URL video tại đây...', th:'วาง URL วิดีโอที่นี่...', it:'Incolla l\'URL del video qui...', ko:'여기에 동영상 URL 붙여넣기...', fil:'I-paste ang video URL dito...', pl:'Wklej URL wideo tutaj...', nl:'Plak video URL hier...', zh:'在此粘贴视频链接...', uk:'Вставте URL відео сюди...' },
  paste_btn:    { en:'Paste from clipboard', ar:'لصق من الحافظة', es:'Pegar del portapapeles', pt:'Colar da área de transferência', id:'Tempel dari clipboard', fr:'Coller depuis le presse-papiers', de:'Aus Zwischenablage einfügen', ja:'クリップボードから貼り付け', tr:'Panodan yapıştır', ru:'Вставить из буфера', hi:'क्लिपबोर्ड से पेस्ट करें', vi:'Dán từ clipboard', th:'วางจากคลิปบอร์ด', it:'Incolla dagli appunti', ko:'클립보드에서 붙여넣기', fil:'I-paste mula sa clipboard', pl:'Wklej ze schowka', nl:'Plakken vanuit klembord', zh:'从剪贴板粘贴', uk:'Вставити з буфера обміну' },
  type_video:   { en:'Video (MP4)', ar:'فيديو (MP4)', es:'Video (MP4)', pt:'Vídeo (MP4)', id:'Video (MP4)', fr:'Vidéo (MP4)', de:'Video (MP4)', ja:'動画 (MP4)', tr:'Video (MP4)', ru:'Видео (MP4)', hi:'वीडियो (MP4)', vi:'Video (MP4)', th:'วิดีโอ (MP4)', it:'Video (MP4)', ko:'동영상 (MP4)', fil:'Video (MP4)', pl:'Wideo (MP4)', nl:'Video (MP4)', zh:'视频 (MP4)', uk:'Відео (MP4)' },
  type_audio:   { en:'Audio (MP3)', ar:'صوت (MP3)', es:'Audio (MP3)', pt:'Áudio (MP3)', id:'Audio (MP3)', fr:'Audio (MP3)', de:'Audio (MP3)', ja:'音声 (MP3)', tr:'Ses (MP3)', ru:'Аудио (MP3)', hi:'ऑडियो (MP3)', vi:'Âm thanh (MP3)', th:'เสียง (MP3)', it:'Audio (MP3)', ko:'오디오 (MP3)', fil:'Audio (MP3)', pl:'Audio (MP3)', nl:'Audio (MP3)', zh:'音频 (MP3)', uk:'Аудіо (MP3)' },
  continue_btn: { en:'Continue →', ar:'متابعة ←', es:'Continuar →', pt:'Continuar →', id:'Lanjutkan →', fr:'Continuer →', de:'Weiter →', ja:'続行 →', tr:'Devam →', ru:'Продолжить →', hi:'जारी रखें →', vi:'Tiếp tục →', th:'ดำเนินการต่อ →', it:'Continua →', ko:'계속 →', fil:'Magpatuloy →', pl:'Kontynuuj →', nl:'Doorgaan →', zh:'继续 →', uk:'Продовжити →' },
  feat1:        { en:'Fast', ar:'سريع', es:'Rápido', pt:'Rápido', id:'Cepat', fr:'Rapide', de:'Schnell', ja:'高速', tr:'Hızlı', ru:'Быстро', hi:'तेज़', vi:'Nhanh', th:'เร็ว', it:'Veloce', ko:'빠름', fil:'Mabilis', pl:'Szybki', nl:'Snel', zh:'快速', uk:'Швидко' },
  feat2:        { en:'Free', ar:'مجاني', es:'Gratis', pt:'Grátis', id:'Gratis', fr:'Gratuit', de:'Kostenlos', ja:'無料', tr:'Ücretsiz', ru:'Бесплатно', hi:'मुफ्त', vi:'Miễn phí', th:'ฟรี', it:'Gratis', ko:'무료', fil:'Libre', pl:'Bezpłatny', nl:'Gratis', zh:'免费', uk:'Безкоштовно' },
  feat3:        { en:'HD Quality', ar:'جودة عالية', es:'Calidad HD', pt:'Qualidade HD', id:'Kualitas HD', fr:'Qualité HD', de:'HD-Qualität', ja:'HD画質', tr:'HD Kalite', ru:'HD качество', hi:'HD गुणवत्ता', vi:'Chất lượng HD', th:'คุณภาพ HD', it:'Qualità HD', ko:'HD 화질', fil:'HD Quality', pl:'Jakość HD', nl:'HD kwaliteit', zh:'高清画质', uk:'HD якість' },
  feat4:        { en:'Mobile Ready', ar:'يعمل على الموبايل', es:'Para móvil', pt:'Para celular', id:'Siap Mobile', fr:'Compatible mobile', de:'Mobilfreundlich', ja:'モバイル対応', tr:'Mobil uyumlu', ru:'Мобильный', hi:'मोबाइल रेडी', vi:'Hỗ trợ di động', th:'รองรับมือถือ', it:'Per mobile', ko:'모바일 지원', fil:'Mobile Ready', pl:'Na mobile', nl:'Mobiel klaar', zh:'移动端支持', uk:'Мобільний' },
  err_no_url:   { en:'Please paste a video URL first.', ar:'الصق رابط الفيديو أولاً.', es:'Pega primero una URL de video.', pt:'Cole primeiro uma URL de vídeo.', id:'Tempel URL video terlebih dahulu.', fr:'Collez d\'abord une URL vidéo.', de:'Bitte füge zuerst eine Video-URL ein.', ja:'動画URLを貼り付けてください。', tr:'Önce bir video URL\'si yapıştırın.', ru:'Сначала вставьте URL видео.', hi:'पहले वीडियो URL पेस्ट करें।', vi:'Hãy dán URL video trước.', th:'กรุณาวาง URL วิดีโอก่อน', it:'Incolla prima un URL video.', ko:'먼저 동영상 URL을 붙여넣으세요.', fil:'Mag-paste muna ng video URL.', pl:'Najpierw wklej adres URL wideo.', nl:'Plak eerst een video URL.', zh:'请先粘贴视频链接。', uk:'Спочатку вставте URL відео.' },
  err_plat:     { en:'Unsupported platform.', ar:'منصة غير مدعومة.', es:'Plataforma no compatible.', pt:'Plataforma não suportada.', id:'Platform tidak didukung.', fr:'Plateforme non prise en charge.', de:'Plattform nicht unterstützt.', ja:'対応していないプラットフォームです。', tr:'Desteklenmeyen platform.', ru:'Платформа не поддерживается.', hi:'असमर्थित प्लेटफ़ॉर्म।', vi:'Nền tảng không được hỗ trợ.', th:'ไม่รองรับแพลตฟอร์มนี้', it:'Piattaforma non supportata.', ko:'지원되지 않는 플랫폼입니다.', fil:'Hindi suportadong platform.', pl:'Nieobsługiwana platforma.', nl:'Platform niet ondersteund.', zh:'不支持的平台。', uk:'Платформа не підтримується.' },
  err_fetch:    { en:'Could not fetch video info. Check the URL and try again.', ar:'تعذّر جلب معلومات الفيديو. تحقق من الرابط وحاول مرة أخرى.', es:'No se pudo obtener información del video.', pt:'Não foi possível obter informações do vídeo.', id:'Tidak dapat mengambil info video.', fr:'Impossible d\'obtenir les informations vidéo.', de:'Videoinfos konnten nicht abgerufen werden.', ja:'動画情報を取得できませんでした。', tr:'Video bilgileri alınamadı.', ru:'Не удалось получить информацию о видео.', hi:'वीडियो जानकारी प्राप्त नहीं हो सकी।', vi:'Không thể lấy thông tin video.', th:'ไม่สามารถดึงข้อมูลวิดีโอได้', it:'Impossibile ottenere info video.', ko:'동영상 정보를 가져올 수 없습니다.', fil:'Hindi makuha ang impormasyon ng video.', pl:'Nie można pobrać informacji o wideo.', nl:'Kan video-informatie niet ophalen.', zh:'无法获取视频信息。', uk:'Не вдалося отримати інформацію про відео.' },
  fetching:     { en:'Fetching info', ar:'جاري التحضير', es:'Obteniendo info', pt:'Buscando info', id:'Mengambil info', fr:'Récupération', de:'Wird geladen', ja:'取得中', tr:'Bilgi alınıyor', ru:'Загрузка', hi:'जानकारी लोड हो रही है', vi:'Đang tải thông tin', th:'กำลังโหลด', it:'Caricamento', ko:'정보 가져오는 중', fil:'Kinukuha ang impormasyon', pl:'Pobieranie informacji', nl:'Informatie ophalen', zh:'正在获取信息', uk:'Завантаження' },
  pasted:       { en:'Pasted!', ar:'تم اللصق!', es:'¡Pegado!', pt:'Colado!', id:'Ditempel!', fr:'Collé !', de:'Eingefügt!', ja:'貼り付けました!', tr:'Yapıştırıldı!', ru:'Вставлено!', hi:'पेस्ट हो गया!', vi:'Đã dán!', th:'วางแล้ว!', it:'Incollato!', ko:'붙여넣기 완료!', fil:'Na-paste na!', pl:'Wklejono!', nl:'Geplakt!', zh:'已粘贴!', uk:'Вставлено!' },

  /* ── DOWNLOAD PAGE ── */
  back:         { en:'New Download', ar:'تحميل جديد', es:'Nueva descarga', pt:'Novo download', id:'Unduhan baru', fr:'Nouveau téléchargement', de:'Neuer Download', ja:'新しいダウンロード', tr:'Yeni indirme', ru:'Новая загрузка', hi:'नया डाउनलोड', vi:'Tải xuống mới', th:'ดาวน์โหลดใหม่', it:'Nuovo download', ko:'새 다운로드', fil:'Bagong download', pl:'Nowe pobieranie', nl:'Nieuwe download', zh:'新下载', uk:'Новий завантаження' },
  not_right:    { en:'Not the right video?', ar:'ليس الفيديو الصحيح؟', es:'¿No es el video correcto?', pt:'Não é o vídeo certo?', id:'Bukan video yang tepat?', fr:'Ce n\'est pas la bonne vidéo?', de:'Nicht das richtige Video?', ja:'違う動画ですか？', tr:'Doğru video değil mi?', ru:'Не то видео?', hi:'सही वीडियो नहीं?', vi:'Không phải video đúng?', th:'ไม่ใช่วิดีโอที่ถูกต้อง?', it:'Non è il video giusto?', ko:'올바른 동영상이 아닌가요?', fil:'Hindi ito ang tamang video?', pl:'Nie to wideo?', nl:'Niet de juiste video?', zh:'不是正确的视频？', uk:'Не те відео?' },
  try_diff:     { en:'Try a different URL →', ar:'جرب رابطاً آخر ←', es:'Probar otra URL →', pt:'Tentar outro URL →', id:'Coba URL lain →', fr:'Essayer une autre URL →', de:'Eine andere URL versuchen →', ja:'別のURLを試す →', tr:'Farklı URL dene →', ru:'Попробовать другой URL →', hi:'दूसरा URL आज़माएं →', vi:'Thử URL khác →', th:'ลอง URL อื่น →', it:'Prova un altro URL →', ko:'다른 URL 시도 →', fil:'Subukan ang ibang URL →', pl:'Spróbuj innego URL →', nl:'Probeer een andere URL →', zh:'尝试其他链接 →', uk:'Спробувати інший URL →' },
  select_q:     { en:'Select Quality', ar:'اختر الجودة', es:'Seleccionar calidad', pt:'Selecionar qualidade', id:'Pilih kualitas', fr:'Choisir la qualité', de:'Qualität wählen', ja:'画質を選択', tr:'Kalite seç', ru:'Выбрать качество', hi:'गुणवत्ता चुनें', vi:'Chọn chất lượng', th:'เลือกคุณภาพ', it:'Seleziona qualità', ko:'화질 선택', fil:'Piliin ang kalidad', pl:'Wybierz jakość', nl:'Selecteer kwaliteit', zh:'选择质量', uk:'Виберіть якість' },
  dl_video:     { en:'Download Video', ar:'تحميل الفيديو', es:'Descargar video', pt:'Baixar vídeo', id:'Unduh video', fr:'Télécharger la vidéo', de:'Video herunterladen', ja:'動画をダウンロード', tr:'Videoyu indir', ru:'Скачать видео', hi:'वीडियो डाउनलोड करें', vi:'Tải video', th:'ดาวน์โหลดวิดีโอ', it:'Scarica video', ko:'동영상 다운로드', fil:'I-download ang video', pl:'Pobierz wideo', nl:'Download video', zh:'下载视频', uk:'Завантажити відео' },
  dl_mp3:       { en:'Download MP3', ar:'تحميل MP3', es:'Descargar MP3', pt:'Baixar MP3', id:'Unduh MP3', fr:'Télécharger MP3', de:'MP3 herunterladen', ja:'MP3をダウンロード', tr:'MP3 indir', ru:'Скачать MP3', hi:'MP3 डाउनलोड करें', vi:'Tải MP3', th:'ดาวน์โหลด MP3', it:'Scarica MP3', ko:'MP3 다운로드', fil:'I-download ang MP3', pl:'Pobierz MP3', nl:'Download MP3', zh:'下载MP3', uk:'Завантажити MP3' },
  preparing:    { en:'Preparing...', ar:'جاري التجهيز...', es:'Preparando...', pt:'Preparando...', id:'Mempersiapkan...', fr:'Préparation...', de:'Wird vorbereitet...', ja:'準備中...', tr:'Hazırlanıyor...', ru:'Подготовка...', hi:'तैयारी हो रही है...', vi:'Đang chuẩn bị...', th:'กำลังเตรียม...', it:'Preparazione...', ko:'준비 중...', fil:'Inihahanda...', pl:'Przygotowywanie...', nl:'Voorbereiden...', zh:'准备中...', uk:'Підготовка...' },
  downloading:  { en:'Downloading...', ar:'جاري التحميل...', es:'Descargando...', pt:'Baixando...', id:'Mengunduh...', fr:'Téléchargement...', de:'Wird heruntergeladen...', ja:'ダウンロード中...', tr:'İndiriliyor...', ru:'Загрузка...', hi:'डाउनलोड हो रहा है...', vi:'Đang tải...', th:'กำลังดาวน์โหลด...', it:'Download in corso...', ko:'다운로드 중...', fil:'Dina-download...', pl:'Pobieranie...', nl:'Downloaden...', zh:'下载中...', uk:'Завантаження...' },
  done_msg:     { en:'Done! Sending file...', ar:'اكتمل! جاري الإرسال...', es:'¡Listo!', pt:'Pronto!', id:'Selesai!', fr:'Terminé!', de:'Fertig!', ja:'完了!', tr:'Tamam!', ru:'Готово!', hi:'हो गया!', vi:'Xong!', th:'เสร็จแล้ว!', it:'Fatto!', ko:'완료!', fil:'Tapos na!', pl:'Gotowe!', nl:'Klaar!', zh:'完成!', uk:'Готово!' },
  calc_size:    { en:'Calculating size...', ar:'جاري حساب الحجم...', es:'Calculando tamaño...', pt:'Calculando tamanho...', id:'Menghitung ukuran...', fr:'Calcul de la taille...', de:'Größe berechnen...', ja:'サイズ計算中...', tr:'Boyut hesaplanıyor...', ru:'Вычисление размера...', hi:'आकार की गणना...', vi:'Đang tính kích thước...', th:'กำลังคำนวณขนาด...', it:'Calcolo dimensione...', ko:'크기 계산 중...', fil:'Kinakalkula ang laki...', pl:'Obliczanie rozmiaru...', nl:'Grootte berekenen...', zh:'正在计算大小...', uk:'Обчислення розміру...' },

  /* ── THANKS PAGE ── */
  thanks_title: { en:'Download Complete!', ar:'اكتمل التحميل!', es:'¡Descarga Completa!', pt:'Download Completo!', id:'Unduhan Selesai!', fr:'Téléchargement Terminé!', de:'Download Abgeschlossen!', ja:'ダウンロード完了!', tr:'İndirme Tamamlandı!', ru:'Загрузка Завершена!', hi:'डाउनलोड पूर्ण!', vi:'Tải Xuống Hoàn Tất!', th:'ดาวน์โหลดเสร็จสิ้น!', it:'Download Completato!', ko:'다운로드 완료!', fil:'Tapos na ang Download!', pl:'Pobieranie zakończone!', nl:'Download voltooid!', zh:'下载完成!', uk:'Завантаження Завершено!' },
  thanks_sub:   { en:'Your file is ready. Check your downloads folder.', ar:'ملفك جاهز. تحقق من مجلد التنزيلات.', es:'Tu archivo está listo. Revisa tu carpeta de descargas.', pt:'Seu arquivo está pronto. Verifique a pasta de downloads.', id:'File Anda siap. Periksa folder unduhan Anda.', fr:'Votre fichier est prêt. Vérifiez votre dossier de téléchargements.', de:'Deine Datei ist bereit. Überprüfe deinen Download-Ordner.', ja:'ファイルが準備できました。ダウンロードフォルダを確認してください。', tr:'Dosyanız hazır. İndirme klasörünüzü kontrol edin.', ru:'Ваш файл готов. Проверьте папку загрузок.', hi:'आपकी फ़ाइल तैयार है। डाउनलोड फ़ोल्डर जांचें।', vi:'File của bạn đã sẵn sàng. Kiểm tra thư mục tải xuống.', th:'ไฟล์ของคุณพร้อมแล้ว ตรวจสอบโฟลเดอร์ดาวน์โหลด', it:'Il tuo file è pronto. Controlla la cartella dei download.', ko:'파일이 준비되었습니다. 다운로드 폴더를 확인하세요.', fil:'Handa na ang iyong file. Tingnan ang iyong downloads folder.', pl:'Twój plik jest gotowy. Sprawdź folder pobierania.', nl:'Uw bestand is klaar. Controleer uw downloadmap.', zh:'您的文件已准备好。请查看下载文件夹。', uk:'Ваш файл готовий. Перевірте папку завантажень.' },
  dl_another:   { en:'⬇ Download Another Video', ar:'⬇ حمّل فيديو آخر', es:'⬇ Descargar otro video', pt:'⬇ Baixar outro vídeo', id:'⬇ Unduh video lain', fr:'⬇ Télécharger une autre vidéo', de:'⬇ Ein weiteres Video herunterladen', ja:'⬇ 別の動画をダウンロード', tr:'⬇ Başka bir video indir', ru:'⬇ Скачать другое видео', hi:'⬇ दूसरा वीडियो डाउनलोड करें', vi:'⬇ Tải video khác', th:'⬇ ดาวน์โหลดวิดีโออื่น', it:'⬇ Scarica un altro video', ko:'⬇ 다른 동영상 다운로드', fil:'⬇ Mag-download ng ibang video', pl:'⬇ Pobierz inne wideo', nl:'⬇ Nog een video downloaden', zh:'⬇ 下载另一个视频', uk:'⬇ Завантажити інше відео' },
  back_home:    { en:'← Back to Home', ar:'← العودة للرئيسية', es:'← Volver al inicio', pt:'← Voltar ao início', id:'← Kembali ke beranda', fr:'← Retour à l\'accueil', de:'← Zurück zur Startseite', ja:'← ホームに戻る', tr:'← Ana sayfaya dön', ru:'← На главную', hi:'← होम पर वापस', vi:'← Về trang chủ', th:'← กลับสู่หน้าหลัก', it:'← Torna alla home', ko:'← 홈으로 돌아가기', fil:'← Bumalik sa home', pl:'← Wróć do strony głównej', nl:'← Terug naar home', zh:'← 返回首页', uk:'← На головну' },
};

/* ── Helper: get translation ── */
function t(key, lang) {
  lang = lang || getLang();
  const row = TRANSLATIONS[key];
  if (!row) return key;
  return row[lang] || row['en'] || key;
}

/* ── Get/Set lang ── */
function getLang() {
  return localStorage.getItem('aio_lang') || 'en';
}
function setLang(code) {
  localStorage.setItem('aio_lang', code);
}

/* ── Apply lang to page ── */
function applyLang(code) {
  const info = LANGS[code];
  if (!info) return;
  setLang(code);
  document.documentElement.lang = code;
  document.documentElement.dir  = info.dir;

  // text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n, code);
  });
  // placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh, code);
  });
  // lang btn
  const btn = document.getElementById('lang-btn');
  if (btn) {
    btn.querySelector('.lbFlag').textContent = info.flag;
    btn.querySelector('.lbCode').textContent = code.toUpperCase();
  }
  // mark active
  document.querySelectorAll('.lang-opt').forEach(o => {
    o.classList.toggle('active', o.dataset.code === code);
  });
}

/* ── Build language menu ── */
function buildLangMenu(containerId) {
  const container = document.getElementById(containerId || 'lang-dropdown');
  if (!container) return;
  const cur = getLang();
  container.innerHTML = Object.entries(LANGS).map(([code, info]) => `
    <div class="lang-opt${code===cur?' active':''}" data-code="${code}" onclick="selectLang('${code}')">
      <span class="lflag">${info.flag}</span>
      <span>${info.name}</span>
    </div>`).join('');
}

function selectLang(code) {
  applyLang(code);
  const dd = document.getElementById('lang-dropdown');
  if (dd) dd.classList.remove('open');
}

function toggleLangMenu() {
  const dd = document.getElementById('lang-dropdown');
  if (dd) dd.classList.toggle('open');
}

/* ── Close on outside click ── */
document.addEventListener('click', e => {
  if (!e.target.closest('.lang-wrap')) {
    const dd = document.getElementById('lang-dropdown');
    if (dd) dd.classList.remove('open');
  }
});

/* ── Shared NAV HTML ── */
function renderNav(activePage) {
  const cur = getLang();
  const info = LANGS[cur] || LANGS['en'];
  return `
<nav class="nav">
  <a class="nav-logo" href="index.html">
    <div class="nav-logo-icon">⬇</div>
    <div class="nav-logo-text">All<span>In</span>One</div>
  </a>
  <div class="nav-right">
    <div class="nav-links">
      <a href="index.html"    class="${activePage==='home'    ?'active':''}" data-i18n="nav_home">Home</a>
      <a href="how-to-use.html" class="${activePage==='howto'?'active':''}" data-i18n="nav_howto">How to Use</a>
      <a href="faq.html"      class="${activePage==='faq'    ?'active':''}" data-i18n="nav_faq">FAQ</a>
    </div>
    <div class="lang-wrap">
      <button class="lang-btn" onclick="toggleLangMenu()" id="lang-btn">
        <span class="lbFlag">${info.flag}</span>
        <span class="lbCode">${cur.toUpperCase()}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="lang-dropdown" id="lang-dropdown"></div>
    </div>
  </div>
</nav>`;
}

/* ── Shared NAV CSS ── */
const NAV_CSS = `
.nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;background:rgba(2,4,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.08);}
.nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:#f0f4ff;}
.nav-logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#4f8eff,#a259ff);display:flex;align-items:center;justify-content:center;font-size:14px;}
.nav-logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:16px;}
.nav-logo-text span{color:#4f8eff;}
.nav-right{display:flex;align-items:center;gap:16px;}
.nav-links{display:flex;gap:20px;}
.nav-links a{color:rgba(240,244,255,0.45);font-size:13px;text-decoration:none;transition:color 0.2s;}
.nav-links a:hover,.nav-links a.active{color:#f0f4ff;}
.lang-wrap{position:relative;}
.lang-btn{display:flex;align-items:center;gap:5px;padding:6px 11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;color:rgba(240,244,255,0.6);font-size:12px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
.lang-btn:hover{border-color:rgba(255,255,255,0.15);color:#f0f4ff;}
.lang-dropdown{position:absolute;top:calc(100% + 8px);right:0;width:200px;background:#0d1320;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:6px;z-index:300;display:none;box-shadow:0 20px 60px rgba(0,0,0,0.6);max-height:340px;overflow-y:auto;}
.lang-dropdown.open{display:block;}
.lang-dropdown::-webkit-scrollbar{width:3px;}
.lang-dropdown::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}
.lang-opt{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:9px;cursor:pointer;font-size:13px;color:rgba(240,244,255,0.5);transition:all 0.15s;}
.lang-opt:hover{background:rgba(255,255,255,0.05);color:#f0f4ff;}
.lang-opt.active{background:rgba(79,142,255,0.1);color:#4f8eff;}
.lang-opt .lflag{font-size:15px;width:20px;text-align:center;}
@media(max-width:500px){.nav-links{display:none;}}
`;
