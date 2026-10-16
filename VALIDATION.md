# Doğrulama

## Marka, İnegöl ve fuar rehberi SEO çalışması — 16 Ekim 2026

Üretim derlemesi geçti: 12 sayfa için içeriği önceden yazılmış HTML, ayrıca `404.html`, görselleri içeren `sitemap.xml` ve `robots.txt` üretildi. Sayfaya özel başlık/açıklama, canonical, Open Graph/Twitter ve JSON-LD aynı modülden üretilir; uygulama içi geçişte önceki ürün verisi temizlenir. `FurnitureStore` firma adresi ve telefonunu, ürün şemaları gerçek galeri fotoğraflarını kullanır. Fuar rehberi tarih veya stant numarası iddiası taşımaz.

20 birim testi ve 22 Chromium senaryosunun tamamı geçti; başarısız veya atlanmış test yok. Yeni SEO senaryoları 12 sayfanın tamamında JavaScript kapalıyken görünür başlık/gövdeyi, başlık/açıklama/canonical eşleşmesini, site haritası ve ürün görsellerini doğrular. Sayfa geçişlerinde metaveri/şema güncellenmesi, 404 için `noindex`, koleksiyona dönüşte `index` ve rehberin 320/390/768/1440 px genişliklerde taşmaması kontrol edildi. Sekiz içerik sayfası ve QR penceresinin WCAG A/AA taramasında ihlal bulunmadı. Galeri, QR çözümleme/indirme, GLB, oda tasarımı, sürükleme/dokunma, kaydet/aç ve mevcut diğer özelliklerin tarayıcı senaryoları da geçti.

Masaüstü ve mobil rehber ile ana sayfanın yeni yerel tanıtım bölümü görsel olarak incelendi. Görüntüler `docs/seo-guide-desktop.png`, `docs/seo-guide-mobile.png` ve `docs/seo-home-local-mobile.png` içindedir. Son JSON içe aktarma düzenlemesi ve rehber ölçülerinin katalogdan okunması sonrası derleme ve 20 birim testi yeniden geçti; etkilenen dört SEO, firma bilgisi ve erişilebilirlik senaryosu da yeniden geçti.

Canlı alan adına HTTPS CONNECT isteği bu ortamın çıkış proxy'sinde 403 ile reddedildi. Bu, hostingin HTTP 403 döndürdüğünü kanıtlamaz. Canlı HTML, yönlendirmeler, sunucunun 404 durum kodu ve Google dizini doğrulanamadı. Hosting veya Search Console hesabında değişiklik yapılmadı. Yayımlama ve dizine ekleme adımları `SEO.md` içindedir. Önceden var olan büyük Three.js parçası derleme uyarısı devam eder; bu çalışmada yeni Lighthouse puanı ölçülmedi.

## Önceki doğrulama — 15 Ekim 2026

- Node.js 24.19.0; kilit dosyasıyla `npm ci` kurulumu tekrar doğrulandı.
- Üretim derlemesi geçti; 11 bağımsız sayfa, sitemap ve robots dosyaları üretildi.
- 17 birim testi geçti; sıfır başarısız/atlanmış test.
- Başlangıç odası ve kaldırılabilir duvarlar sonrası 18 Chromium senaryosunun tamamı geçti; sıfır başarısız/atlanmış test.
- Son detay galerisi düzenlemesinde ilgili altı Chromium senaryosu geçti (iki yeni galeri senaryosu dahil).
- QR PNG dosyası gerçek QR çözümleme kütüphanesiyle okunup canonical ürün adresi doğrulandı.
- Mouse ve gerçek touch olaylarıyla mobilya sürükleme doğrulandı.
- Oda işlemleri, kaydet/aç/sil, PNG görüntü indirme, doğrudan URL yenileme, WebGL fallback, küre coğrafi dokusu ve animasyon kontrolleri doğrulandı.
- Yedi normal içerik sayfasında, azaltılmış hareket tercihiyle yapılan axe WCAG A/AA taramasında ihlal bulunmadı. Bu otomatik tarama tek başına tüm erişilebilirlik koşulları için sertifika değildir.

## Dokuz detay fotoğrafı ve yakınlaştırmalı ürün galerisi — 15 Ekim 2026

`detay gorseller.zip` içindeki `nass1/2/3.png`, `sila1/2/3.png`, `nassberjer1/2/3.png` fotoğrafları sırasıyla Nass Model, Sıla Model ve Nass Berjer ile eşleştirildi. Her galeride ana fotoğraf + üç detay bulunur; Kristal Model tek fotoğrafıyla kalır. Orijinal PNG'ler byte düzeyinde ZIP ile karşılaştırılarak `public/assets/source-images/details/` altında korundu. Orijinal çözünürlükte kalite 92 WebP'ler ve geliştirme/derlemede üretilen duyarlı türevler kullanılır. 14 yerel görselin türevleri ve 11 sayfalık üretim derlemesi geçti.

Galeri seçimi büyük fotoğrafı değiştirir. Ortak çerçeveler ve `object-fit: contain` oranları korur; fotoğraflar esnetilmez veya kırpılmaz. Fotoğraf düğmesi yerel HTML dialog açar: %100–400 yakınlaştırma, düğmeler, fare tekerleği, iki parmak, sürükleyerek gezinme, önceki/sonraki fotoğraf ve klavye kontrolleri vardır. Pencere tam çözünürlüklü WebP'yi kullanır. Escape/kapatma odağı geri verir; hızlı kapat/aç ve eski asenkron görüntü çözümleme işlemleri yeni pencere durumunu bozamaz. Sayfa geçişinde pencere ve gözlemciler temizlenir.

17 birim testi ve ilgili altı Chromium senaryosu geçti. Yeni galeri senaryosu 1440 px masaüstü ve 390 px telefonda dört ürünün tüm fotoğraflarını, seçimin büyük fotoğrafa geçmesini, çerçeve boyutunun sabit kalmasını, %150/%400 zoom, sınırlar, gerçek fare sürüklemesi, sıfırlama, fotoğraf okları, Escape, odak dönüşü, yeniden açma ve sayfa geçişinde temizliği doğrular. Ayrı dokunmatik senaryo gerçek CDP çoklu dokunma hareketiyle büyütmeyi ve tekerlek zoomunu doğrular. Açık fotoğraf penceresi WCAG A/AA taramalarını geçti. Önceki sayfa/metaveri/varlıklar, mobil menü, QR çözümleme/indirme ve içerik erişilebilirliği kontrolleri de geçti. 320 × 568 ve 844 × 390 görünümde pencere ve %100 fotoğrafın ekrana sığması ayrıca kontrol edildi.

Önizlemeler: `docs/product-gallery-desktop.png`, `docs/product-zoom-desktop.png`, `docs/product-zoom-mobile.png`. Canlı hosting bu işlemle güncellenmez; yeni `dist` içeriğinin yüklenmesi gerekir.

## Köşe kolonu, hazır pencereler ve kaldırılabilir duvarlar — 15 Ekim 2026

Yeni 4 × 5 × 2,7 m odada iki duvarın birleşiminde 40 × 40 cm kolon (merkez X/Z=0,2 m) ve her duvarda 120 × 110 cm, denizliği 90 cm olan bir pencere bulunur. Pencereler duvarların ortasındadır. Kolonun ve pencere listelerinin her oda için bağımsız kopyaları üretilir. Yeni kolon ekleme formu X/Z=0 ile başlar; sınır kontrolü kolonun ölçüsüne göre köşeye oturtur. Kullanıcının düzenlediği kolon konumları ayrıca değiştirilebilir.

**03 — Duvarlar ve Pencereler** bölümünde her duvar için göster/kaldır seçeneği eklendi. Kapalı duvarın geometrisi, çerçeveleri ve camları sahneye eklenmez; duvar geri açıldığında ayrı silinmemiş pencereler korunur. Gizli duvarın pencereleri düzenlenemez, ancak listeden silinebilir. İki duvar da kapalıysa pencere ekleme kontrolleri devre dışıdır. Kolon ayrı nesne olarak kalır ve ayrıca silinebilir. `room.walls` kayda eklenir; eski kayıtlarda iki duvar açık varsayılır, pencere/kolon listeleri değiştirilmez. Sıfırlama yeni hazır mimariyi getirir; kaldırılan mimari kaydı açıldığında kendiliğinden eklenmez.

Üretim derlemesi, 17 birim testi ve 18 Chromium senaryosu geçti; başarısız/atlanmış test yok. Yeni birim kontrolleri köşe yerleşimi, pencere geçerliliği, duvar kaldırıldığında raycast ile açıklık, cam/çerçeve kaldırılması, bağımsız kolonun korunması, eski boş kayıt uyumu ve duvar verisi doğrulamasını kapsar. Yeni tarayıcı senaryosu masaüstü ve telefonda hazır nesneleri, oda büyürken köşede kalmayı, duvar kaldırıp geri getirmeyi, pencere/kolon silmeyi, sonraki kolonu köşeden eklemeyi, sıfırlama ve yenileme sonrası kayıt açmayı doğrular. Duvar kontrollerinin WCAG A/AA taraması da geçti. Önceki oda, kaplama, sürükleme, GLB, QR ve erişilebilirlik senaryoları geçti.

Güncel masaüstü ve mobil önizlemeler `docs/room-default-desktop.png` ve `docs/room-default-mobile.png` dosyalarındadır. Canlı hosting bu işlemle güncellenmez; yeni `dist` içeriğinin yüklenmesi gerekir.

## Duvar renkleri ve zemin kaplamaları — 15 Ekim 2026

Oda ayarlarında **02 — Duvar ve Zemin** eklendi: arka ve yan duvar rengi ayrı seçilebilir; meşe parke, ceviz parke, seramik ve beton kaplamaları arasında geçilebilir ve zemin rengi ayrıca ayarlanabilir. Renk girişi mevcut malzemelere anında uygulanır; geometri ve doku nesneleri korunur. Kaplama değişimi oda mimarisini yeniden kurar; mobilyaları ve kamera konumunu değiştirmez. Kolonlar arka duvar rengini kullanır. Yerel, deterministik DataTexture desenleri metre ölçeğinde tekrar eder; oda büyürken malzeme boyutu sabit kalır.

`room.appearance` duvar renklerini ve zemin seçimini sürüm 1 oda kaydında saklar. Önceki kayıtlarda bu alan yoksa varsayılanlar eklenir. Geçersiz renk ve kaplama bilgileri reddedilir. Kaydı açma ve sıfırlama tüm yeni kontrolleri eşitler; kayıt otomatik silinmez. PNG dışa aktarımı mevcut yüzeyleri içerir.

Üretim derlemesi, 14 birim testi ve 17 Chromium senaryosu geçti; başarısız/atlanmış test yok. Yeni birim kontrolleri eski kayıt uyumu, özel görünümün dönüşü, geçersiz kayıtlar, pencere çerçevelerinin korunması, malzeme/geometri kimliğinin renk girişinde değişmemesi ve kaplama ölçeğini doğrular. Yeni tarayıcı senaryosu 1440 px masaüstü ve 390 px mobilde her duvarın ve zemin renginin ayrı ayrı gerçek canvas piksellerini değiştirmesini, dört kaplamanın görünür farkını, sıfırlama/yenileme/kaydı açma, oda ölçüsü değişiminde görünümün korunması, PNG indirme ve yeni ayarların WCAG A/AA taramasını doğrular. Önceki sürükleme, gerçek pencere açıklıkları, mobilyalar, GLB yükleme, QR ve erişilebilirlik senaryoları da geçti.

Önizlemeler: `docs/room-surfaces-desktop.png` (seramik), `docs/room-surfaces-parquet.png` (ceviz parke), `docs/room-surfaces-mobile.png` (telefon ayarları). Canlı hosting bu işlemle güncellenmez; yeni `dist` içeriğinin `public_html` içine yüklenmesi gerekir.

## Alt imza logosu ve daha küçük üst logolar — 15 Ekim 2026

Alt bölümdeki büyük `ali turan.` yazısı aynı şeffaf marka logosuyla değiştirildi. Logo krem zeminde koyu renkte, ortalanmış ve en fazla 420 px genişlikte gösterilir; telefonda 260 px ile sınırlanır. Ana görseldeki beyaz logonun genişliği masaüstünde %84'ten %70'e, telefonda %92'den %80'e indirildi. Üst menü logosu da 190→170 px ve telefonda 160→145 px olarak küçültüldü. Tüm görsellerin 4:1 oranı korunur.

Derleme ve ilgili üç Chromium senaryosu geçti. 320, 390, 768, 1024 ve 1440 px genişlikte üst/alt logo boyutları, kaynak yüklemesi, ana görsel düğmesiyle çakışmama ve yatay taşma olmaması doğrulandı. Masaüstü, mobil ve alt bölüm önizlemeleri `docs/brand-desktop.png`, `docs/brand-mobile.png`, `docs/brand-footer.png` olarak güncellendi. Canlı hosting bu işlemle güncellenmez.

## Ana sayfadaki büyük beyaz logo — 15 Ekim 2026

Kullanıcının işaretlediği `.hero-wordmark` içindeki `ali turan.` metni tam marka logosuyla değiştirildi. `Beyaz ALI TURAN Logo ve Kurt Silüeti.zip` içindeki 2172 × 724 px RGBA görsel incelendi; harflerin çevresinde beyaz lekeler ve çizgiler bulundu. Bu izleri yayımlamamak için daha önce sağlanan temiz şeffaf PNG aynı alanda CSS `brightness(0) invert(1)` filtresiyle beyaz gösterilir. Kaynak görsel değiştirilmedi; yeni bir logo üretilmedi.

Görsel 4:1 oranını korur ve dekoratif olduğu için erişilebilirlik ağacında tekrarlanmaz. 320, 390, 768, 1024 ve 1440 px genişlikte yüklenme, beyaz filtre, ana görsel sınırları içinde kalma, yatay taşma olmaması, düğme ve alt açıklamayla çakışmama doğrulandı. Üretim derlemesi ve ilgili üç Chromium senaryosu (erişilebilirlik, sayfa/metaveri/varlıklar, mobil menü) geçti. Masaüstü/mobil önizlemeler `docs/brand-desktop.png` ve `docs/brand-mobile.png` olarak güncellendi. Canlı hosting bu işlemle güncellenmez.

## Şeffaf tam marka logosu — 15 Ekim 2026

`ali_turan_logo_seffaf.zip` içindeki PNG 3000 × 750 px RGBA biçimindedir. Alfa kanalı 0–255 aralığındadır; 1.807.260 tam şeffaf piksel içerir. Siyaha yakın yazı ve amblem, sitenin krem zemininde doğru görünür. Orijinal dosya baytları değiştirilmeden `public/assets/branding/ali-turan-logo.png` olarak eklendi. Önceki küçük amblem + düz marka yazısı yerine üst menü ve alt bilgide tam logo kullanılır; Organization JSON-LD logo adresi de güncellendi. Favicon önceki ICO dosyası olarak korunur. Önceki bölümde beklenen geniş logo bu ZIP ile tamamlanmıştır.

Derleme ve ilgili üç Chromium senaryosu (sayfa/metaveri/varlıklar, mobil menü, erişilebilirlik) geçti. Orijinal ve derlenmiş logo dosyaları karşılaştırıldı; 320, 390, 768, 1024 ve 1440 px genişlikte yüklenme, 4:1 oranı, şeffaflığın korunması, yatay taşma ve menüyle çakışma olmaması kontrol edildi. Güncel önizlemeler `docs/brand-mobile.png`, `docs/brand-desktop.png` ve `docs/brand-footer.png` içindedir. Canlı hosting bu işlemle güncellenmez.

## AL Wolf amblemi ve favicon — 15 Ekim 2026

Site sahibinin sağladığı ICO dosyası tek bir 32 × 32 px kare içerir. `public/assets/icons/al-wolf.ico` orijinalle bayt düzeyinde aynıdır; aynı kare kayıpsız PNG olarak `al-wolf.png` dosyasına aktarılıp üst menü ve alt bilgide mevcut marka yazısının yanında doğal boyutuyla kullanılır. Favicon bağlantısı ve Organization JSON-LD logo adresi güncellendi. İletideki geniş görsel tamamen siyah göründüğü ve yerel kaynak dosyası bulunmadığı için geniş logo eklenmedi; orijinal PNG/SVG dosyası bekleniyor.

Derleme 11 sayfayla geçti. İlgili üç Chromium senaryosu (erişilebilirlik, sayfa/metaveri/varlıklar, mobil menü) geçti. 320, 390, 768, 1024 ve 1440 px genişlikte iki amblemin yüklenmesi, 32 px boyutunu koruması, yatay taşma ve menü düğmesiyle çakışma olmaması doğrulandı. Favicon HTTP 200 ile indirildi ve kaynak ICO ile karşılaştırıldı. 11 sayfa ve 404 belgesi dahil 12 HTML dosyasının tamamı yeni ICO adresini kullanır. Önizlemeler `docs/brand-mobile.png` ve `docs/brand-desktop.png` içindedir. Canlı hosting güncellenmedi.

## Kullanıcının sağladığı FBX modelinin eklenmesi — 15 Ekim 2026

`orange+lounge+chair+3d+model.zip` içinde bir FBX ve beş doku haritası bulundu. Blender 4.3.2 ile `scripts/convert-nass-fbx.py` kullanılarak GLB üretildi; kaynak dosyalar değiştirilmedi. GLB, 47.770 üçgenli tek mesh ve gömülü renk/normal/metal-pürüzlülük dokuları içerir. Doku boyutları 4096 px'ten 2048 px'e indirildi; dosya 7.736.008 bayttır. Draco veya başka özel çözücü gerektirmez. SHA-256: `ed2ef69b83a1ee15030cf9e07c894844f3817164c61fc711e00fc6179ac52aa9`.

Gerçek tarayıcıdaki GLTFLoader üzerinden dosyanın yedek geometriye düşmeden yüklenmesi (`procedural: false`, `loadFailed: false`), tüm dört malzeme haritasının 2048 × 2048 px olması, ayrı yüklemelerin bağımsız nesne/malzeme kullanması ve renk değişiminin ortak kumaş/ahşap atlasını bozmaması kontrol edildi. Sınır kutusu X=0,95 m / Y=0,90 m / Z=0,95 m; alt yüzey Y=0. Ölçüler önceki tahmini değerlerdir.

`model3dParts: false` ile ürün sayfası aynı dosyayı çevrilebilir ve yakınlaştırılabilir olarak gösterir; ayrılma kontrolleri gizlenir. Tek mesh yerine eski prosedürel sandalyenin gösterilmesi önlendi. Oda tasarımcısı da GLB'yi kullanır. Orijinal renk atlası ahşapla ortak olduğu için korunur. Diğer ürünlerin parçalanma animasyonu değişmez.

Üretim derlemesi, 11 birim testi ve 16 Chromium senaryosu geçti. Yeni senaryo 1440 px masaüstü ve 390 px mobilde GLB yüklemesini, model döndürmeyle canvas görüntüsünün değişmesini, ayrılma kontrollerinin gizlenmesini ve aynı modelin oda tasarımcısında açılmasını doğrular. Diğer ürünlerin animasyonu, fare/dokunmatik sürükleme, QR çözümleme ve WCAG A/AA kontrolleri de geçti.

Gerçek dosyadan ön/yan/arka/çapraz renderlar yeniden üretildi (`docs/nass-berjer-views.png`); katalog fotoğraf/3D karşılaştırması da güncellendi. Derlenen `dist/assets/models/nass-berjer.glb` kaynakla bayt düzeyinde aynıdır. Canlı hosting bu işlemle güncellenmez; yeni `dist` içeriğinin `public_html` içine yüklenmesi gerekir.

## QR pencere oranı, indirme çözünürlüğü ve hedef adres — 15 Ekim 2026

QR kütüphanesinin canvas'a eklediği 768 px inline yükseklik, genişlik mobilde `max-width` ile kısıtlandığında korunuyordu. Sorun 390 × 844 px görünümde 286 × 768 px QR alanı ve 1040 px pencere içeriğiyle yeniden üretildi. Ekran kodu kare ve duyarlı SVG'ye taşındı; indirme bundan bağımsız canvas'ta tam piksel modülleriyle oluşturulup beyaz kenarlıkla 2048 × 2048 px'e ortalanır. Bu yöntem kütüphanenin kesirli ölçekle 2047 px çıktı üretmesini de giderir. Hazırlık tamamlanana kadar indirme düğmesi kapalıdır; pencere kapatılıp yeniden açıldığında eski asenkron işlem yeni içeriğe yazamaz.

Dört ürün 320 × 568, 390 × 844, 1440 × 1000 ve 844 × 390 px görünümlerde kontrol edildi. Ekran görüntüsündeki QR ve indirilen PNG ayrı ayrı gerçek QR okuyucuyla çözüldü: sekiz çözümlemede de `https://alituranmob.com/urun/<slug>` hedefi doğrulandı. İndirilen dört dosya 2048 × 2048 px'tir. Normal telefon ve masaüstünde pencere içinde dikey/yatay taşma yoktur; kısa yatay görünümde gerekli dikey kaydırma ve PNG indirme çalışır. Sayfalar/metaveri, mobil arayüz, QR ve erişilebilirlik kontrolleri geçti; yedi sayfa ve açık QR penceresindeki axe WCAG A/AA taramasında ihlal bulunmadı. Üretim derlemesi 11 sayfayla geçti. Mobil ve masaüstü örnekler `docs/qr-mobile.png` ve `docs/qr-desktop.png` içindedir.

Canlı alan adına bu ortamın proxy'sinden erişim 403 ile engellendi; hosting dosyaları ve gerçek sunucu önbelleği doğrulanamadı. Kullanıcının paylaştığı görüntü eski ürün adını içerir. Yeni sürümün yayımlanması için `.htaccess`, HTML ve `assets` dahil tüm yeni `dist` içeriği hostingde güncellenmeli; eski kaydedilmiş QR dosyaları yenileriyle değiştirilmelidir.

## Git'ten yeni indirilen projede geliştirme görselleri

Görsel türevleri ve `dist/` olmadan hazırlanan temiz Git dosyalarında eski `npm run dev` başlangıcıyla eksik görsel sorunu tekrarlandı. `predev` düzeltmesinden sonra, derleme çalıştırmadan 20 WebP türevi otomatik oluşturuldu. Gerçek Chromium'da ana sayfa, koleksiyon ve 3+3+1 ürün sayfasındaki toplam 32 görsel yüklemesi masaüstü (1440 px) ve mobil (390 px) genişliklerde doğrulandı; eksik görsel kalmadı. Kontrol mevcut kurulu bağımlılıkları kullandı; yeniden bağımlılık kurulumu bu kontrolde denenmedi.

## Referansa göre yenilenen tasarım

Fotoğraf üzerinde kapsül menü, büyük marka yazısı, krem/kahverengi paneller ve berjerin altı tasarım detayını işaretleyen bölüm kullanıcının gönderdiği referansa göre uyarlandı. Katalog, ürün ve diğer sayfalar aynı tipografi, düğme ve panel düzenine taşındı. Dört ürün, fotoğrafları ve iletişim bilgileri korundu. Yeni tasarımda 8 birim testi ve 15 tarayıcı senaryosu doğrulandı; erişilebilirlik testinde bulunan oda tasarımcısı tanıtım metninin kontrastı düzeltilip yedi sayfalık erişilebilirlik taraması tekrar geçti.

Ana sayfa, koleksiyon, 3+3+1 detay, iletişim ve hakkımızda sayfaları 320, 390, 768, 1024 ve 1440 px genişliklerde kontrol edildi; 25 görünümde yatay taşma bulunmadı. Dar ekranlardaki 3D animasyon kontrolleri iki satıra uyarlanıp animasyon, mobil menü ve erişilebilirlik testleri tekrar geçti. Masaüstü ve mobil ana sayfa önizlemeleri `docs/design-desktop.png` ve `docs/design-mobile.png` dosyalarındadır.

## Fotoğraflara göre güncellenen 3D modeller

Dört model ve 3+3+1 takımın bağımsız parçaları fotoğraflardaki oturma düzeni, sırt/kollar, ahşap kuşak/yan çerçeve, ayaklar ve yastıklarla uyarlanmıştır. Tahmini ölçüler ve zemine oturma kontrolü korunur. Yeni testler tüm üretilen geometri verilerinin sonlu olduğunu, her modelin 100.000 üçgenin altında kaldığını ve renk değişiminin ahşap, metal ve dekoratif yastıkları değiştirmediğini doğrular. Oda tasarımcısı ve parçalanma animasyonu tarayıcıda kontrol edildi. Karşılaştırma `docs/3d-models.png`, güncel oda önizlemesi `public/assets/images/room-preview.webp` dosyasındadır. 3D geometri ve sentetik kumaş desenleri yaklaşık temsillerdir.

Dört ürün sayfasının canlı 3D gösterimi hem birleşik hem tamamen ayrılmış durumda tekrar renderlandı; boş canvas veya JavaScript hatası bulunmadı. Köşe ve takım kameraları oturumları daha net gösterecek şekilde ayarlandı.

### GPT-6 Astra ile ikinci modelleme geçişi

Berjer ve köşe kolları öne/aşağı kıvrılan oval hacimlere dönüştürüldü. Oturumlar ve serbest yastıklar dolduruldu; köşelerde düz sırtları birleştiren kapalı, eğrisel döşeme paneli oluşturuldu. Ahşap kuşaklar ve üçgen yan çerçeveler geniş, pahlanmış yüzeyler kullanır. Deforme edilmiş döşeme geometrilerinde konuma göre ortak normal hesaplaması yüzeydeki sert üçgen/bant izlerini giderir. Bouclé dokusunda renk ve kabartı aynı düzensiz ilmek alanından üretilir; antrasit döşemede düşük kontrastlı çiçek desenleri kullanılır. Döşeme rengi değişirken kumaş parlaklık rengi de güncellenir.

Son geometriyle 10 birim testi ve üretim derlemesi üzerinde 15 Chromium tarayıcı senaryosu geçti. Dört modelin oda yerleşimleri ayrıca 1440 ve 390 px genişliklerde açılıp klavyeyle hareket ettirildi; takım üç bağımsız parça olarak kaldı. Her ürünün gerçek WebGL canvas'ı birleşik ve tamamen ayrılmış durumda renderlandı; boş canvas veya JavaScript hatası bulunmadı. Fotoğraf karşılaştırması ve oda önizlemesi yeni geometriyle tekrar üretildi. Fotoğraflar ve tahmini ölçü verileri değiştirilmedi. Bu sürüm fotoğraftan uyarlanan yaklaşık geometri kullanır; CAD veya fotogrametri taraması değildir.

## Nass Berjer: yeni ön, yan ve arka referanslar — 15 Ekim 2026

Kullanıcının eklediği dört açıya göre yalnızca Nass Berjer’in geometrisi yeniden kuruldu. Kollar ve alt yan parçalar C biçimindeki açıklıkları koruyan tek döşemeli yüzeyle arka sırta bağlanır. Yan ve arka dönüşler yuvarlatıldı; ince ayrı başlık, kısa ahşap başlık köprüsü, ön köşelerle sınırlı ahşap kuşak ve döşemenin önüne uzanan yuvarlak uçlu ayaklar eklendi. Yeni üretici ölçüsü verilmediğinden ölçüler tahmini kalır. Ürün fotoğrafları değiştirilmedi.

Yeni gövde kapalı bir alandan üretilen, köşe normalleri ortak ve önbelleğe alınan yüzeydir; her örnek bağımsız geometri kopyası kullanır. Gövde 32.034 köşe ve 63.936 üçgen, tam berjer 77.604 üçgendir. Yeni test yan oyukların açık, üst/alt yan dolguların ve arka sırtın dolu olduğunu ışın kesişimleriyle doğrular; yüzey normalleri de sonlu ve birim uzunluktadır. 11 birim testi, 15 üretim Chromium senaryosu ve 11 sayfalık derleme geçti. Sürükleme, mobil touch, renk değiştirme ve parçalanma animasyonu kontrol edildi. Gerçek geometrinin dört açılı incelemesi `docs/nass-berjer-views.png`, güncel genel karşılaştırma `docs/3d-models.png` dosyasındadır. Hosting hesabına yükleme yapılmadı.

### GPT-6 Astra ile dört orijinal JPEG üzerinden yeniden çalışma

`WhatsApp Unknown 2026-10-15 at 13.48.21.zip` içindeki dört JPEG, ayrı GPT-6 Astra oturumunda doğrudan incelendi. Yan C profili fotoğraflardan eğrisel bir konturla yeniden kuruldu; ön kol uçları genişletilip dışa açıldı. Başlık yüksekliği artırıldı, bel yastığı daha dolu bir yüzeyle modellendi, ön ayaklar yumuşak omuz ve hafif dışa/öne eğim kazandı. Oturum ve alt gövdenin arkası yan kabuğun içinde kalacak şekilde daraltıldı; arka alt köşeler geniş yarıçapla ve alt kenar hafif minder kavisiyle yeniden şekillendirildi. Aynı kamera ve ışıklarla alınan ön/yan/arka/çapraz renderlar root tarafından incelenerek iki düzeltme turu yapıldı.

Son Nass modeli 83.220 üçgendir; kabuk 33.401 köşe ve 66.656 üçgen kullanır. Ölçek 95 × 95 × 90 cm (X × Z × Y), ölçüler hâlâ tahminidir. Bağımsız iki örneğin kabuk geometrisi ve position buffer'ı ayrı kalır. Son geometriyle 11 Node testi ve üretim derlemesi üzerinde 15 Chromium senaryosu geçti. Nass ayrıca 1440 ve 390 px genişliklerde oda yerleşimi, klavyeyle taşıma ve gerçek canvas'ın birleşik/tam ayrılmış renderlarıyla kontrol edildi; boş canvas veya JavaScript hatası bulunmadı. `docs/nass-berjer-views.png` ve genel fotoğraf/3D karşılaştırması güncellendi. Ürün galerisine yeni fotoğraf eklenmedi; hosting hesabına yükleme yapılmadı.

## Model adları ve bildirilen ölçüler — 15 Ekim 2026

Köşeler Nass Model (X 280 × Z 300 cm) ve Sıla Model (X 230 × Z 300 cm), takım Kristal Model olarak güncellendi. Kristal'in iki kanepesi 235 cm, berjeri 90 cm genişliğindedir. Bu ürünlerin yüksekliği 85 cm, Kristal kanepe derinliği 95 cm ve berjer derinliği 90 cm tahminidir. Adı verilen ürünler artık geçici model adı olarak etiketlenmez; ürün sayfaları ve statik metaveri tahmini kalan ölçüleri açıklar. Ürün kimlikleri ve mevcut URL'ler korunur. Takımın yalnızca önizlemede kullanılan yerleşim sınır kutusu, yeni parça ölçülerine göre 325 × 317,5 cm olarak güncellendi.

10 birim testi ve 15 Chromium senaryosu geçti. Yeni adlarla katalog araması, parça başına 235/90 cm genişlikler, takımın üç bağımsız parça olarak açılıp kaydedilmesi, 3D ölçekler ve mobil görünüm kontrol edildi. Nass/Sıla için X-Z sırası ile ürün HTML metaverisindeki tahmin notları ayrıca doğrulandı. Fotoğraf karşılaştırması ve oda önizlemesi yeni ölçülerle tekrar üretildi. Hosting hesabına yükleme yapılmadı.

Fuarın Gözdesi etiketli tek berjerin adı daha sonra Nass Berjer olarak güncellendi. Ürün adı, ana sayfa açıklaması ve görsel alt metni, katalog/arama ve karşılaştırma görseli yeni adı kullanır. Üretim HTML başlığı ile ölçülerin tahmini olduğunu belirten not doğrulandı; derleme ve katalog/arama/takım yerleşimini kapsayan üç mevcut Chromium senaryosu geçti.

## Güzel Hosting alan adı ve güncelleme — 15 Ekim 2026

Site sahibinin bildirdiği `https://alituranmob.com` adresi şirket verisi, HTML başlangıç metaverisi, QR hedefleri ve yayımlama belgelerine uygulandı. Yeni derlemede 11 sayfanın canonical adresleri, sitemap, robots ve uygulama paketindeki alan adı kontrol edildi. Doğrudan sayfalar/metaveri ve indirilen QR PNG'sinin gerçek çözümlemesini kapsayan iki Chromium senaryosu geçti. Apache `.htaccess` dosyasına, `mod_headers` etkin olduğunda HTML/XML/TXT yanıtlarını yeniden doğrulatan `Cache-Control: no-cache` kuralı eklendi; gerçek hosting yanıt başlıkları doğrulanamadı.

Kullanıcı yerel geliştirme sunucusunda güncel sürümün açıldığını doğruladı. Bu ortamın HTTPS proxy'si alan adına erişimi 403 ile engellediğinden canlı sunucudaki dosyalar ve eski görünümün kesin nedeni incelenemedi. Yeni `dist` içeriğinin cPanel'de tümüyle üzerine yazılarak yüklenmesi ve tarayıcıda tekrar kontrol edilmesi gerekiyor. Hosting hesabına dosya yüklenmedi veya DNS değiştirilmedi.

## Mobil Lighthouse

Aşağıdaki ölçüm önceki örnek katalog sürümünde yapıldı; bu dört ürünlük sürüm için Lighthouse yeniden çalıştırılmadı. Önceki yerel üretim dosyalarında Lighthouse 12.8.2'nin varsayılan mobil benzetimiyle ölçüldü. Temel Python statik sunucusu HTTP sıkıştırma ve üretim cache başlıkları sağlamaz; canlı barındırma koşulları ayrıca ölçülmelidir.

- performance: 87/100
- accessibility: 100/100
- best-practices: 100/100
- seo: 100/100

Tam Lighthouse raporu bu çalışma ortamında `/workspace/scratch/alituran-lighthouse.json` dosyasındadır.

## Yayım öncesi gerçek içerikler

Katalogda yalnızca kullanıcı tarafından sağlanan dört model vardır: Fuarın Gözdesi berjer, iki köşe koltuk ve 3+3+1 takım. Model isimleri geçici, ölçüler tahminidir. Dört orijinal PNG dosyası ZIP içerikleriyle SHA-256 karşılaştırmasında eşleşmiştir. Ana sayfa ve katalog sırası, fotoğraf eşleştirmesi, takımın parça ölçüleri ve üç bağımsız mobilya olarak kaydedilip geri yüklenmesi tarayıcıda doğrulanmıştır. 3D modeller yaklaşık yerleşim temsilleridir. Ali Turan Koltuk adı, İnegöl adresi, Feyzi Yiğit’in telefon/WhatsApp numarası ve Almanya/Avusturya/Kosova sevkiyat bilgileri site sahibi tarafından sağlanmıştır. Küredeki işaretler ülke ve ilçe genelini temsil eder. Telefon, WhatsApp ve Google Maps hedefleri tarayıcı testinde doğrulandı. Gerçek ürün GLB dosyaları, fiziksel cihazlar ve canlı domain DNS/HTTPS ayrıca doğrulanmalıdır. Halka açık site yayımı ve DNS değişikliği yapılmadı. Yayımlama ve içerik düzenleme adımları README.md içindedir.
