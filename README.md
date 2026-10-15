# Ali Turan Koltuk — İnegöl / Bursa

Türkçe, statik bir mobilya kataloğu ve Three.js oda tasarımcısı. Sepet, ödeme, hesap, veritabanı, ücretli API veya sürekli çalışan Node.js sunucusu gerektirmez. Üretim çıktısı `dist/` klasöründeki statik dosyalardır.

## Başlangıç

Node.js 22.12+ veya 24 LTS kullanın. Bu ortamda Node.js 24.19.0 ile doğrulandı.

```bash
npm ci
npm run dev
```

Vite geliştirme sunucusu 5173 portunda çalışır. Bu sunucu sadece geliştirme içindir.

```bash
npm run build
npm run preview
```

Üretim önizlemesi 4173 portundadır. `npm run build` önce yerel görsellerin farklı ekranlar için WebP kopyalarını hazırlar, ardından tüm normal sayfalar ve ürünler için bağımsız HTML dosyaları, sosyal paylaşım metaverisi, canonical adresleri, `robots.txt`, `sitemap.xml` ve `404.html` oluşturur. Örneğin `dist/urun/fuari-gozdesi-berjer/index.html` doğrudan açılabilir; sayfa yenilemek bağlantıyı bozmaz.

## Özellikler

Tasarım, site sahibinin paylaştığı mobilya sitesi referansına göre uyarlanmıştır: koyu kahverengi çerçeve, krem paneller, fotoğraf üstünde kapsül menü, büyük marka yazısı ve berjerin detaylarını işaretleyen çizgiler. Ana sayfa, katalog, ürün detayları ve şirket sayfaları aynı Manrope tipografisini kullanır. Ortak arayüz ve 3D alanlarının temel stilleri `src/styles/main.css`, güncel görsel tasarım `src/styles/reference.css` içindedir. Masaüstü ve mobil önizlemeler `docs/` altında bulunur.

- Mobil menü, editoryal ana sayfa, 4 model: Fuarın Gözdesi berjer, iki köşe koltuk ve bir 3+3+1 takım, kategori filtreleri ve Türkçe arama.
- Ürün galerileri, renk seçimi, santimetre cinsinden ölçüler, ilgili modeller.
- `https://alituranmob.com/urun/<slug>` adresini içeren yüksek çözünürlüklü QR kodu ve PNG indirme.
- Ortografik kamera, iki duvarlı gerçek 3D oda, sınırlı orbit ve yakınlaştırma.
- Oda genişliği/derinliği/yüksekliği, duvarda gerçek pencere açıklıkları, kolon ekleme/düzenleme/silme.
- Arka/yan duvar için ayrı renkler; meşe/ceviz parke, seramik ve beton zemin kaplamaları; özel zemin rengi. Seçimler oda kaydında saklanır.
- Mobilya seçme, mouse/touch sürükleme, konum girme, 15° döndürme, silme, model ve renk değiştirme.
- Metre bazında gerçek ölçek; dönmüş modeller için oda sınırı kontrolü; mobilya/kolon çakışma uyarısı.
- Tarayıcıda yerel oda kaydı, kayıt açma/silme, oda/kamera sıfırlama, PNG görünüm dışa aktarma.
- Küreyi döndürme, yakınlaştırma ve konum seçme; yerel coğrafi veri.
- Parçaların ayrılması/birleşmesi: oynat, duraklat, tersine oynat, yeniden başlat ve ilerleme sürgüsü.
- 3D ve QR kodları gerektiğinde yüklenir. WebGL desteği yoksa erişilebilir açıklama gösterilir.
- Yerel WebP görseller, yerel WOFF2 yazı tipleri; azaltılmış hareket tercihi ve klavye kontrolleri.

## İçerik düzenleme

Site sahibi `src/data/` altındaki JSON dosyalarını düzenleyebilir. JSON dosyalarında tırnak, virgül ve süslü parantezleri koruyun. Değişiklikten sonra derlemeyi yeniden çalıştırın; GitHub'a bağlı Netlify gibi bir hizmet bunu otomatik yapabilir.

| Dosya             | İçerik                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| `products.json`   | Ürünler, kategoriler, renkler, ölçüler, fotoğraflar, model yolları        |
| `company.json`    | Ana görsel ve başlık, şirket metinleri, adres, telefon, e-posta, WhatsApp |
| `locations.json`  | Doğrulanmış veya açıkça etiketlenmiş örnek küre konumları                 |
| `navigation.json` | Mevcut sayfaların menü sırası ve Türkçe adları                            |

### Yeni ürün eklemek

`products.json` içindeki bir kaydı kopyalayın. Benzersiz `id` ve URL için benzersiz, küçük ASCII harflerden oluşan `slug` kullanın:

```json
{
  "id": "yeni-model",
  "slug": "yeni-kose-koltuk",
  "name": "Yeni Köşe Koltuk",
  "category": "Köşe Koltuklar",
  "description": "Onaylı ürün açıklaması.",
  "images": ["/assets/images/yeni-model.webp"],
  "colors": [{ "name": "Keten", "hex": "#c7b7a1" }],
  "dimensions": { "width": 280, "depth": 190, "height": 85 },
  "type": "corner",
  "model3d": null,
  "featured": true,
  "demo": false,
  "temporaryName": true,
  "dimensionStatus": "estimated"
}
```

- Ölçüler **santimetredir**; tasarımcı bunları metreye dönüştürür. Gerçek üretici ölçülerini ekleyin.
- `type`: `corner`, `modular`, `straight`, `chair`, `set`. GLB yoksa buna göre orantılı örnek model üretilir.
- `images`: en az bir yerel görsel. İlk görsel katalog kartıdır; diğerleri ürün galerisidir.
- `colors`: en az bir isim ve geçerli 6 basamaklı hex renk.
- `featured`: ana sayfada görünmesini sağlar.
- Katalog kategorileri veriden otomatik oluşturulur.
- Ürün silmek için kaydı kaldırın ve yeniden derleyin. Ürün bağlantılarının dışarıda paylaşılmış olabileceğini dikkate alın.

### Mevcut dört model

Sıra: Fuarın Gözdesi (Nass Berjer), Nass Model, Sıla Model, Kristal Model. Nass 280 × 300 cm, Sıla 230 × 300 cm (X × Z); her iki köşenin yüksekliği şimdilik 85 cm tahminidir. Kristal takımının üçlü kanepeleri 235 cm, berjeri 90 cm genişliğindedir. Kanepe derinliği 95 cm, berjer derinliği 90 cm ve yükseklikleri 85 cm tahmini değerlerdir. Yeni bilgiler `products.json` içindeki ölçülerden güncellenebilir. `dimensionStatus: "partial"` ve `dimensionNote` kısmen bildirilen ölçüleri açıklar; `temporaryName: false` firma tarafından verilen model adlarını belirtir. Nass Berjer’in ölçüleri henüz tahminidir.

Takım `type: "set"` ve `composition: "3+3+1"` kullanır. `components` alanındaki `quantity` iki üçlü kanepe ve bir berjeri belirtir; ölçü tablosu her parçanın ölçülerini ayrı gösterir ve tahmini değerleri açıklayan not içerir. `dimensions` bu kayıtta yalnızca 3D önizleme yerleşiminin sınır kutusudur (`dimensionScope: "preview-layout"`), takımın üretici ölçüsü değildir. `previewLayout` metre cinsinden parça merkezlerini ve radyan cinsinden dönüşlerini belirler. Oda tasarımcısı takım bağlantısını üç bağımsız mobilya olarak açar; parça ölçülerini yerleşimden dolayı değiştirmez.

Ek kanepe veya berjer fotoğrafları gelirse takımın `images` listesine ekleyin; bunlar yeni katalog ürünü değildir. Ana sayfa etiketini, görsel alt metnini ve bağlantısını `company.json → hero.eyebrow/imageAlt/productSlug` alanlarından düzenleyin.

### Fotoğraf değiştirmek

Fotoğrafları `public/assets/images/` içine yükleyin; JSON içinde `/assets/images/dosya.webp` yolunu kullanın. İnternet fotoğraf bağlantısını doğrudan kullanmayın. Tercihen 900–1600 px genişlikte WebP, gerçek ürünü temsil eden ve kullanım hakları doğrulanmış görseller seçin. Ana sayfa için `company.json → hero.image`, başlık için `hero.heading` ve alt metin için `hero.description` alanlarını düzenleyin. Başlıkta `\n` satır sonudur.

`npm run dev` ve `npm run build`, JPG/PNG/WebP kaynaklarını değiştirmeden 320, 640, 1024 ve 1536 px WebP türevlerini oluşturur; tarayıcı `srcset` ve `sizes` ile uygun olanı seçer. Geliştirme sunucusu `predev` adımı tamamlandıktan sonra açılır. Böylece Git'ten yeni indirilen projede de görseller hazır olur. `-w320.webp` gibi son ekler üretilen dosyalara ayrılmıştır. Bu dosyalar Git'e eklenmez. Kaynak görselleri silmeyin.

### Ürün galerisi ve fotoğraf yakınlaştırma

Nass Model, Sıla Model ve Nass Berjer galerilerinde ana fotoğrafa ek üçer detay fotoğrafı bulunur. Küçük fotoğrafı seçmek büyük alandaki görseli değiştirir. Tüm büyük görseller ve küçük görseller kendi ortak çerçeve boyutlarını korur; `object-fit: contain` fotoğrafı esnetmez veya kırpmaz.

Büyük görsele / **Fotoğrafı büyüt** düğmesine tıklayarak fotoğraf penceresini açın. +/− düğmeleri, fare tekerleği veya telefonda iki parmakla %100–400 aralığında yakınlaştırın; sürükleyerek gezinin. Önceki/sonraki düğmeleri ve klavye okları fotoğraf değiştirir. `+`, `−`, `0` yakınlaştırmayı yönetir; Escape veya kapatma düğmesi pencereyi kapatır ve odağı galeriye döndürür. Büyütme penceresi tam çözünürlüklü WebP kullanır. Fotoğraf ayrıntısının sınırı kaynak dosyanın çözünürlüğüdür.

Fotoğraflar `products.json → images` sırasıyla gösterilir; ilk fotoğraf katalog/ana sayfa görseli olarak kalır. Galeri davranışı `src/ui/product-gallery.js` içindedir. ZIP'teki orijinal PNG'ler `public/assets/source-images/details/`, WebP'ler `public/assets/images/details/` altında saklanır. `npm run dev` / `npm run build` yeni görsellerin duyarlı türevlerini de hazırlar.

### Başlangıç odası, kolon ve pencereler

Yeni oda 4 × 5 × 2,7 m ölçülerinde iki duvar, birleşim köşesinde 40 × 40 cm kolon ve her duvarda bir pencereyle açılır. Yeni kolon ekleme formu da varsayılan olarak birleşim köşesinden başlar; kolonun ölçüsü ve konumu sonradan değiştirilebilir.

**03 — Duvarlar ve Pencereler** bölümünde **Arka duvarı göster** ve **Yan duvarı göster** seçeneklerini kapatarak duvarları kaldırın. Duvarla birlikte üzerindeki cam ve çerçeve de gizlenir. Duvar geri getirildiğinde silinmemiş pencereler geri görünür. Listelerdeki çöp kutularıyla pencereleri ve **04 — Kolonlar** bölümünden kolonu ayrıca silebilirsiniz. İki duvar da kapalıysa pencere ekleme devre dışıdır.

Bu seçimler oda kaydında korunur. Eski kayıtlar mevcut pencere/kolon listeleriyle açılır; kendiliğinden yeni nesne eklenmez. **Odayı Sıfırla** yeni başlangıç odasını (kolon ve iki pencere dahil) geri getirir; saklanan kayıt korunur.

### Duvar ve zemin düzenleme

Odanı Tasarla → **02 — Duvar ve Zemin** bölümünde arka ve yan duvar renklerini ayrı seçin. Zemin kaplaması meşe parke, ceviz parke, seramik veya beton olabilir; zemin rengi ayrıca değiştirilebilir. Kaplama seçimi kendi başlangıç rengini getirir. Renkler anında uygulanır; mobilyalar ve kamera yerinde kalır. Kolonlar arka duvar rengini kullanır.

**Tasarımı Kaydet** bu seçimleri de saklar; **Kaydı Aç** geri getirir. Önceki sürümlerdeki kayıtlar varsayılan krem duvarlar ve meşe parke ile açılır. **Odayı Sıfırla** yüzeyleri de varsayılanlara döndürür; saklanan kayıt korunur. PNG indirmesi seçili renkleri ve kaplamayı içerir. Telefonda **Ayarlar** düğmesinden aynı bölüme ulaşılır.

Varsayılanlar ve seçenekler `src/three/room-finishes.js`, yerel yüzey desenleri `src/three/room-surfaces.js` içindedir. Desenler metreye göre tekrar eder; oda büyüdüğünde parke ve seramik boyutları değişmez. Hazır doku indirme veya ek hizmet gerekmez.

### Gerçek 3D model eklemek

Mevcut dört modelin fotoğraflara göre uyarlanan geometrileri `src/three/photo-furniture.js` içindedir. GPT-6 Astra ile yenilenen sürümde dolgulu oturumlar, hacimli serbest yastıklar, köşe boyunca devam eden kapalı döşemeli sırtlar, pahlanmış geniş ahşap çerçeveler ve incelen ayaklar kullanılır. Fuarın Gözdesi oval kollar, ayrı yüksek başlık ve bel minderiyle modellenmiştir. Eğrisel yüzey normalleri ortak konumlarda yumuşatılır; kumaş UV'leri panel ölçeğine göre hesaplanır. Kumaş dokusu, ahşap damarı ve yastık desenleri yerel, sentetik `DataTexture` yüzeyleridir; fotoğraftaki gerçek kumaşın birebir taraması değildir. Modeller girilen ölçülere ölçeklenir; eksik ölçüler için kullanılan tahmini değerler ürün açıklamasında belirtilir. Renk değişimi yalnızca döşemeyi etkiler; ahşap, metal ve dekoratif yastıklar korunur.

Geliştirme sunucusu açıkken `npm run render:models`, gerçek etkileşimli geometrilerin fotoğraflarla karşılaştırmasını `docs/3d-models.png` dosyasına yazar. Fotoğrafları değiştirmez. Render araçları mevcut Chromium'u veya `CHROMIUM_PATH` değerini kullanır.

Nass Berjer’in dosya yüklenemediğinde kullanılan, ön/yan/arka referanslarına göre hazırlanan yedek gövdesi `src/three/nass-armchair.js` içindedir. Tek, kapalı döşemeli yüzeyde C biçimindeki yan açıklıklar ve arka sırt birlikte modellenir; üst ve alt yan parçalar sırta yumuşak dönüşlerle bağlanır. Ayrı ince başlık, kısa ahşap başlık köprüsü, ön kuşak ve döşemenin önüne çıkan yuvarlak uçlu ayaklar kullanılır. Yüzeyin ortak köşeleri birleştirilir, şablon önbelleğe alınır ve her yerleşime bağımsız geometri kopyalanır. Geliştirme sunucusu açıkken `npm run render:nass`, gerçek modelin ön, yan, arka ve çapraz görünümlerini `docs/nass-berjer-views.png` dosyasına yazar. Geometri fotoğraflardan uyarlanmıştır; mevcut ölçüler tahminidir.

Son Nass Berjer düzenlemesinde GPT-6 Astra, site sahibinin ZIP olarak sağladığı dört orijinal JPEG’i doğrudan incelemiştir. Kol uçları, başlık oranı, arka alt köşeler, bel yastığı ve ön ayaklar bu referanslara göre yeniden çalışılmıştır. Ortak render kameraları korunarak sürümler aynı açılardan karşılaştırılır.

Nass Berjer artık site sahibinin gönderdiği `orange+lounge+chair+3d+model.zip` içindeki FBX modelini kullanır. `public/assets/models/nass-berjer.glb`, Blender 4.3.2 ile dönüştürülmüş 47.770 üçgenli tek mesh içerir. Renk, normal ve metal/pürüzlülük haritaları 2048 px olarak GLB’ye gömülüdür (yaklaşık 7,4 MiB); harici doku isteği gerekmez. Kaynak ZIP ve orijinal dokular değiştirilmez. Yeniden dönüşüm: `blender -b --python scripts/convert-nass-fbx.py -- /path/to/extracted-source public/assets/models/nass-berjer.glb`. Blender yalnızca dönüşüm için gerekir; normal geliştirme ve derleme için gerekmez.

Üründe `model3dParts: false`, tek yüzeyli modeli ürün sayfasında çevrilebilir/yakınlaştırılabilir olarak gösterir; ayrılma kontrolleri gizlenir ve eski prosedürel sandalyeye dönülmez. Oda tasarımcısı da aynı GLB’yi kullanır. Ahşap ve kumaş aynı malzeme atlasında bulunduğundan modelin orijinal rengi korunur.

Yeni bir GLB dosyasını `public/assets/models/` içine koyun; ürünün `model3d` alanını `/assets/models/kose-modeli-01.glb` gibi ayarlayın. `null` değeri prosedürel örnek modeli seçer. Model yüklenemezse açıklamalı örnek model kullanılır.

Modeller Y yukarı ekseniyle hazırlanmalıdır. Yerleşimde modelin sınır kutusu ürünün `width/depth/height` ölçülerine ölçeklenir ve zemine oturtulur. Gömülü dokulu GLB tercih edin. Aynı dizindeki dış dokulu GLTF de desteklenir. Malzeme renklerinin değişmesini istediğiniz mesh adlarında `fabric`, `upholstery` veya `kumas` kullanın.

Parçalanma animasyonu için ayrı meshler kullanın: `base`, `seat`, `back`, `arm`, `leg`, `cushion`; sol/sağ kol için `left`/`right`. Tek yüzeyli modeller için `model3dParts: false` ayarlayın. Diğer modellerde ayrı parçalar bulunamazsa açıkça örnek animasyona dönülür. Birleşik tek mesh gerçek iç yapı gösterimi olarak sunulmaz. Yerleşim ve görsel tutarlılığını her model eklendikten sonra doğrulayın.

Kartların mevcut 3D görselleri bu projede üretilmiştir. İsteğe bağlı yeniden üretim: Vite çalışırken `node scripts/render-assets.mjs`. Bu yardımcı işlem ayrıca Chromium ister; sitenin çalışması veya normal derlemesi bunları gerektirmez.

### İletişim bilgileri

`company.json` içindeki `address`, `phone`, `phoneDisplay`, `contactPerson`, `email`, `whatsapp`, `showroomHours`, `mapUrl`, `story`, `production` alanlarından iletişim ve şirket bilgilerini düzenleyin. Adres, Feyzi Yiğit’in telefon/WhatsApp numarası ve sevkiyat yapılan ülkeler site sahibi tarafından sağlanan bilgilerle doldurulmuştur. E-posta, sosyal medya ve ziyaret saatleri paylaşılmadığından uydurulmamıştır. WhatsApp numarasını ülke koduyla girin (`+90...`); bağlantı için rakamlar kullanılır. `socials` için örnek biçim: `{ "label": "Instagram", "url": "https://..." }`.

`null` alanlar bilinmeyen bilgileri açıkça belirtir; boş bilgiler için sahte e-posta veya WhatsApp düğmesi gösterilmez. Bu sürüm mesaj gönderen form içermez. Gizlilik metninin resmî şirket/veri sorumlusu bölümü yayımdan önce tamamlanmalıdır.

### Uluslararası konumlar

`locations.json` içindeki İnegöl kaydı şirketin bulunduğu ilçeyi, Almanya/Avusturya/Kosova kayıtları sevkiyat yapılan ülkeleri gösterir. Bilgiler site sahibi tarafından sağlanmıştır. `kind: "base"` şirket konumunu, `kind: "export"` sevkiyat ülkesini belirtir. Ülke işaretlerinde `city: null` kullanılır; bir depo veya showroom adresi ima edilmez. Koordinatlar ülke/ilçe genelini temsil eder; açık adres Google Maps arama bağlantısındadır. Diğer Balkan ülkeleri tek tek belirtilmediğinden listeye eklenmemiştir. Yeni kayıtlar için `id`, `kind`, `country`, `city`, `latitude`, `longitude`, `description`, `demo` alanlarını düzenleyin. Örnek işaretler eklenirse `demo: true` kullanın.

### QR kodları

Ürünün sayfasında “QR Kodu Göster” → “PNG İndir (2048 × 2048)”. Ekrandaki kod, kare oranını koruyan SVG olarak gösterilir. PNG dosyası ayrıca, modülleri tam piksel boyutlarında çizilip ortalanarak tam 2048 × 2048 px üretilir; en az dört modül beyaz kenar boşluğu ve yüksek hata düzeltme seviyesi kullanılır. Pencere normal telefon ekranlarında taşmaz; kısa yatay ekranlarda içerik kaydırılarak erişilebilir. Tarayıcı testinde dört ürünün hem ekranda görünen QR'sı hem indirilen PNG'si gerçek bir QR okuyucuyla çözülür ve `alituranmob.com` üzerindeki ürün hedefleri doğrulanır. Mobil ve masaüstü önizlemeler `docs/qr-mobile.png` ve `docs/qr-desktop.png` dosyalarındadır.

Canonical domain `company.json → domain` alanından gelir ve `https://alituranmob.com` olarak ayarlıdır. Alan adını değiştirirseniz yeniden derleyin; önceden basılmış QR kodlarının hedefi değişmez. Kodların yayında açılması için domain ve HTTPS kurulumunu tamamlamak gerekir.

## Statik yayımlama ve alan adı

**Netlify:** Depoyu bağlayın, derleme komutu `npm run build`, çıktı `dist`. `netlify.toml` hazırdır. Ürünler için HTML üretilir; backend gerekmez.

**Cloudflare Pages:** Aynı derleme komutu ve `dist` çıktısı; Node.js 24 seçin. Üretilen dizin `index.html` dosyaları temiz yolları destekler. `404.html` gerçek 404 çıktısıdır.

**Apache/cPanel:** `dist` içindeki tüm dosyaları (gizli `.htaccess` dahil) domainin belge köküne yükleyin. `mod_rewrite` ve izin verilen `.htaccess` kuralları temiz ürün yollarını destekler.

Güncellemede proje ana klasöründe `git pull` ve `npm run build` çalıştırın. Yeni oluşan `dist` içeriğini ZIP'e ekleyin; cPanel'de belge köküne çıkarırken aynı adlı dosyaların üzerine yazın. `index.html`, `assets/` ve sayfa klasörleri aynı seviyede bulunmalıdır. Apache `mod_headers` etkinse `.htaccess`, HTML ve sitemap gibi metin dosyalarına `Cache-Control: no-cache` ekleyerek tarayıcının yeni sürümü sunucudan doğrulamasını sağlar. Vite'ın JS/CSS dosya adları içerik değiştiğinde yenilenir; güncellemede yalnızca `index.html` yerine tüm `dist` içeriğini yükleyin.

**Nginx:** Site kökünü `dist` olarak ayarlayın; örnek konum kuralı `try_files $uri $uri/ =404;`, dizin indeksi `index.html`. Tüm bilinmeyen yolları ana sayfaya çevirmek gerekmez.

**GitHub Pages:** Özel domain `alituranmob.com` ve kök yol kullanın; `dist` çıktısını Pages'e dağıtın. Proje alt dizini (`/alituran/`) için Vite `base` ve veri yolları ayrıca uyarlanmalıdır.

Barındırma panelinde özel domain olarak `alituranmob.com` ekleyin. Panelin verdiği A/AAAA veya CNAME değerlerini alan adı DNS ayarlarına **aynen** girin; sağlayıcıya göre değiştikleri için bu projede DNS değerleri uydurulmadı. `www` için tercih ettiğiniz yönlendirmeyi ve HTTPS sertifikasını sağlayıcı panelinde açın. Ardından ana sayfayı, doğrudan ürün adreslerini ve QR hedeflerini gerçek domain üzerinden kontrol edin.

GitHub'daki kaynak dosyaları web sitesi yayımı yerine geçmez. Canlı site için yukarıdaki statik barındırma ve DNS adımlarını uygulayın.

## Testler

```bash
npm test
npm run test:browser
```

İkinci komut önce üretim derlemesini oluşturur, sonra gerçek statik HTTP sunucusunda Playwright kontrollerini çalıştırır. Test sunucusu Python 3 ister. Chromium `/usr/bin/chromium` yolunda yoksa `npx playwright install chromium` ile test tarayıcısını kurun veya `CHROMIUM_PATH` değişkeni sağlayın.

Testler ürün ölçülerini, gerçek pencere açıklıklarını, dönmüş nesne sınırlarını, çakışma tespitini, kayıt doğrulamasını, tüm bağlantıları, doğrudan ürün yollarını, aramayı, filtreleri, QR çözümleme/indirmeyi, sürükleme ve touch davranışlarını, oda işlemlerini, küreyi, animasyonu, mobil taşmayı, WebGL fallback ve erişilebilirliği kapsar. Fiziksel telefon tarayıcıları, gerçek ürün GLB'leri, canlı domain/DNS ve gerçek şirket iletişim hizmetleri ayrıca yayım sonrasında doğrulanmalıdır.

## Varlık kaynakları ve örnek içerik

Kaynaklar ve lisans dosyaları `ASSETS.md` ve `public/assets/licenses/` içindedir. Hiçbir NORDICA logosu veya görseli kullanılmadı. Güncel tasarım, kullanıcının paylaştığı referans ekran görüntüsüne göre uyarlanmıştır.

Katalog yalnızca kullanıcı tarafından gönderilen dört modeli içerir. Berjer “Fuarın Gözdesi” etiketiyle ilk sıradadır ve ana görseldir. Nass, Sıla ve Kristal adları ile bildirilen ölçüler site sahibinden alınmıştır; kalan ölçüler şimdilik tahminidir. Görseller `modeller.zip` dosyasından alınmıştır; orijinal PNG dosyaları `public/assets/source-images/` altında korunur. Her model için yalnızca fotoğrafta görülen renk listelenir. Prosedürel 3D modeller yaklaşık yerleşim temsilleridir. Adres, iletişim kişisi ve sevkiyat ülkeleri kullanıcı tarafından sağlanmıştır.

## Proje yapısı

```text
src/data/        Düzenlenebilir JSON içerikleri
src/pages/       Katalog, ürün, şirket sayfaları ve oda arayüzü
src/three/       3D motor, modeller, oda geometrisi, küre, animasyon
src/styles/      Tasarım sistemi, mobil görünümler, yerel fontlar
src/utils/       İkonlar, güvenli metin/bağlantı yardımcıları
public/assets/   Yerel görseller, fontlar, modeller, coğrafi veri, lisanslar
scripts/         Statik ürün sayfası üretimi ve isteğe bağlı oda önizlemesi üretimi
tests/           Boyut/geometri testleri ve tarayıcı kabul testleri
```
