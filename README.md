# ALI TURAN — Furniture & Living

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

Üretim önizlemesi 4173 portundadır. `npm run build` önce yerel görsellerin farklı ekranlar için WebP kopyalarını hazırlar, ardından tüm normal sayfalar ve ürünler için bağımsız HTML dosyaları, sosyal paylaşım metaverisi, canonical adresleri, `robots.txt`, `sitemap.xml` ve `404.html` oluşturur. Örneğin `dist/urun/atlas-kose-koltuk/index.html` doğrudan açılabilir; sayfa yenilemek bağlantıyı bozmaz.

## Özellikler

- Mobil menü, editoryal ana sayfa, 7 örnek ürün, kategori filtreleri ve Türkçe arama.
- Ürün galerileri, renk seçimi, santimetre cinsinden ölçüler, ilgili modeller.
- `https://alituran.com/urun/<slug>` adresini içeren yüksek çözünürlüklü QR kodu ve PNG indirme.
- Ortografik kamera, iki duvarlı gerçek 3D oda, sınırlı orbit ve yakınlaştırma.
- Oda genişliği/derinliği/yüksekliği, duvarda gerçek pencere açıklıkları, kolon ekleme/düzenleme/silme.
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
  "demo": true
}
```

- Ölçüler **santimetredir**; tasarımcı bunları metreye dönüştürür. Gerçek üretici ölçülerini ekleyin.
- `type`: `corner`, `modular`, `straight`, `chair`. GLB yoksa buna göre orantılı örnek model üretilir.
- `images`: en az bir yerel görsel. İlk görsel katalog kartıdır; diğerleri ürün galerisidir.
- `colors`: en az bir isim ve geçerli 6 basamaklı hex renk.
- `featured`: ana sayfada görünmesini sağlar.
- Katalog kategorileri veriden otomatik oluşturulur.
- Ürün silmek için kaydı kaldırın ve yeniden derleyin. Ürün bağlantılarının dışarıda paylaşılmış olabileceğini dikkate alın.

### Fotoğraf değiştirmek

Fotoğrafları `public/assets/images/` içine yükleyin; JSON içinde `/assets/images/dosya.webp` yolunu kullanın. İnternet fotoğraf bağlantısını doğrudan kullanmayın. Tercihen 900–1600 px genişlikte WebP, gerçek ürünü temsil eden ve kullanım hakları doğrulanmış görseller seçin. Ana sayfa için `company.json → hero.image`, başlık için `hero.heading` ve alt metin için `hero.description` alanlarını düzenleyin. Başlıkta `\n` satır sonudur.

Derleme JPG/PNG/WebP kaynaklarını değiştirmeden 320, 640, 1024 ve 1536 px WebP türevlerini oluşturur; tarayıcı `srcset` ve `sizes` ile uygun olanı seçer. `-w320.webp` gibi son ekler üretilen dosyalara ayrılmıştır. Bu dosyalar Git'e eklenmez, her derlemede hazırlanır. Kaynak görselleri silmeyin.

### Gerçek 3D model eklemek

GLB dosyasını `public/assets/models/` içine koyun; ürünün `model3d` alanını `/assets/models/atlas.glb` gibi ayarlayın. `null` değeri prosedürel örnek modeli seçer. Model yüklenemezse açıklamalı örnek model kullanılır.

Modeller Y yukarı ekseniyle hazırlanmalıdır. Yerleşimde modelin sınır kutusu ürünün `width/depth/height` ölçülerine ölçeklenir ve zemine oturtulur. Gömülü dokulu GLB tercih edin. Aynı dizindeki dış dokulu GLTF de desteklenir. Malzeme renklerinin değişmesini istediğiniz mesh adlarında `fabric`, `upholstery` veya `kumas` kullanın.

Parçalanma animasyonu için ayrı meshler kullanın: `base`, `seat`, `back`, `arm`, `leg`, `cushion`; sol/sağ kol için `left`/`right`. Ayrı parçalar bulunamazsa açıkça örnek animasyona dönülür. Birleşik tek mesh gerçek iç yapı gösterimi olarak sunulmaz. Yerleşim ve görsel tutarlılığını her model eklendikten sonra doğrulayın.

Kartların mevcut 3D görselleri bu projede üretilmiştir. İsteğe bağlı yeniden üretim: Vite çalışırken `node scripts/render-assets.mjs`. Bu yardımcı işlem ayrıca Chromium ve Python/Pillow ister; sitenin çalışması veya normal derlemesi bunları gerektirmez.

### İletişim bilgileri

`company.json` içindeki `address`, `phone`, `email`, `whatsapp`, `showroomHours`, `mapUrl`, `story`, `production` alanlarına **gerçek ve onaylı** bilgileri ekleyin. WhatsApp numarasını ülke koduyla girin (`+90...`); bağlantı için rakamlar kullanılır. `socials` için örnek biçim: `{ "label": "Instagram", "url": "https://..." }`.

`null` alanlar bilinmeyen bilgileri açıkça belirtir; boş bilgiler için sahte e-posta veya WhatsApp düğmesi gösterilmez. Bu sürüm mesaj gönderen form içermez. Gizlilik metninin resmî şirket/veri sorumlusu bölümü yayımdan önce tamamlanmalıdır.

### Uluslararası konumlar

`locations.json` içine `id`, `country`, `city`, `latitude`, `longitude`, `description`, `demo` alanları ekleyin. Gerçek konumlar onaylandıysa `demo: false` kullanın. İlk İstanbul işareti sadece etkileşim örneğidir; şirketin faaliyeti, adresi veya ihracat iddiası değildir. Hiç işaret istemiyorsanız dosyayı `[]` yapın.

### QR kodları

Ürünün sayfasında “QR Kodu Göster” → “PNG Olarak Kaydet”. Kodlar 768 px, dört modül kenar boşluğu ve yüksek hata düzeltme seviyesiyle oluşturulur. Tarayıcı testinde indirilen PNG gerçek bir QR okuyucuyla çözülür ve canonical hedef doğrulanır.

Canonical domain `company.json → domain` alanından gelir ve başlangıçta `https://alituran.com` olarak ayarlıdır. Alan adını değiştirirseniz yeniden derleyin; önceden basılmış QR kodlarının hedefi değişmez. Kodların yayında açılması için domain ve HTTPS kurulumunu tamamlamak gerekir.

## Statik yayımlama ve alan adı

**Netlify:** Depoyu bağlayın, derleme komutu `npm run build`, çıktı `dist`. `netlify.toml` hazırdır. Ürünler için HTML üretilir; backend gerekmez.

**Cloudflare Pages:** Aynı derleme komutu ve `dist` çıktısı; Node.js 24 seçin. Üretilen dizin `index.html` dosyaları temiz yolları destekler. `404.html` gerçek 404 çıktısıdır.

**Apache/cPanel:** `dist` içindeki tüm dosyaları (gizli `.htaccess` dahil) domainin belge köküne yükleyin. `mod_rewrite` ve izin verilen `.htaccess` kuralları temiz ürün yollarını destekler.

**Nginx:** Site kökünü `dist` olarak ayarlayın; örnek konum kuralı `try_files $uri $uri/ =404;`, dizin indeksi `index.html`. Tüm bilinmeyen yolları ana sayfaya çevirmek gerekmez.

**GitHub Pages:** Özel domain `alituran.com` ve kök yol kullanın; `dist` çıktısını Pages'e dağıtın. Proje alt dizini (`/alituran/`) için Vite `base` ve veri yolları ayrıca uyarlanmalıdır.

Barındırma panelinde özel domain olarak `alituran.com` ekleyin. Panelin verdiği A/AAAA veya CNAME değerlerini alan adı DNS ayarlarına **aynen** girin; sağlayıcıya göre değiştikleri için bu projede DNS değerleri uydurulmadı. `www` için tercih ettiğiniz yönlendirmeyi ve HTTPS sertifikasını sağlayıcı panelinde açın. Ardından ana sayfayı, doğrudan ürün adreslerini ve QR hedeflerini gerçek domain üzerinden kontrol edin.

GitHub'daki kaynak dosyaları web sitesi yayımı yerine geçmez. Canlı site için yukarıdaki statik barındırma ve DNS adımlarını uygulayın.

## Testler

```bash
npm test
npm run test:browser
```

İkinci komut önce üretim derlemesini oluşturur, sonra gerçek statik HTTP sunucusunda Playwright kontrollerini çalıştırır. Test sunucusu Python 3 ister. Chromium `/usr/bin/chromium` yolunda yoksa `npx playwright install chromium` ile test tarayıcısını kurun veya `CHROMIUM_PATH` değişkeni sağlayın.

Testler ürün ölçülerini, gerçek pencere açıklıklarını, dönmüş nesne sınırlarını, çakışma tespitini, kayıt doğrulamasını, tüm bağlantıları, doğrudan ürün yollarını, aramayı, filtreleri, QR çözümleme/indirmeyi, sürükleme ve touch davranışlarını, oda işlemlerini, küreyi, animasyonu, mobil taşmayı, WebGL fallback ve erişilebilirliği kapsar. Fiziksel telefon tarayıcıları, gerçek ürün GLB'leri, canlı domain/DNS ve gerçek şirket iletişim hizmetleri ayrıca yayım sonrasında doğrulanmalıdır.

## Varlık kaynakları ve örnek içerik

Kaynaklar ve lisans dosyaları `ASSETS.md` ve `public/assets/licenses/` içindedir. Hiçbir NORDICA logosu veya görseli kullanılmadı. Referans ekran görüntüsü paylaşılmadığı için tarif edilen görsel yön esas alındı.

Ürün isimleri, ölçüler, renkler, prosedürel mobilyalar ve iç mekân fotoğrafları başlangıç örnekleridir. Şirket tarihçesi, üretim kapasitesi, sertifika, gerçek ürün malzemesi veya ihracat ülkesi uydurulmadı. Yayımdan önce örnek koleksiyonu gerçek bilgilerle değiştirin.

## Proje yapısı

```text
src/data/        Düzenlenebilir JSON içerikleri
src/pages/       Katalog, ürün, şirket sayfaları ve oda arayüzü
src/three/       3D motor, modeller, oda geometrisi, küre, animasyon
src/styles/      Tasarım sistemi, mobil görünümler, yerel fontlar
src/utils/       İkonlar, güvenli metin/bağlantı yardımcıları
public/assets/   Yerel görseller, fontlar, modeller, coğrafi veri, lisanslar
scripts/         Statik ürün sayfası üretimi ve isteğe bağlı görsel üretimi
tests/           Boyut/geometri testleri ve tarayıcı kabul testleri
```
