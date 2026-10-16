# Ali Turan Mobilya SEO — 16 Ekim 2026

Hedef alan adı: **https://alituranmob.com**. Bu çalışma site içeriğini ve teknik SEO altyapısını düzenler. GitHub'a kod yüklemek canlı hostingi güncellemez; Google'ın tarama, dizine ekleme ve sıralama kararları ayrıca gerçekleşir.

## Arama niyeti ve sayfalar

| Arama / konu                                           | Ana sayfa hedefi                          |
| ------------------------------------------------------ | ----------------------------------------- |
| Ali Turan, Ali Turan koltuk, Ali Turan mobilya         | `/` ve `/hakkimizda`                      |
| İnegöl mobilyası | `/` |
| İnegöl köşe koltuk, koltuk takımı, berjer              | `/koleksiyon` ve ilgili dört ürün sayfası |
| Ali Turan İnegöl adres, telefon                        | `/iletisim`                               |
| İnegöl fuarı, İnegöl mobilya fuarı koltuk seçimi       | `/inegol-mobilya-fuari`                   |
| İnegöl'den Almanya, Avusturya, Kosova koltuk sevkiyatı | `/dunyada-biz`                            |

Ana sayfa ve firma metinleri marka, gerçek İnegöl adresi ve ürünlerle ilişkilendirildi. Fuar sayfası ziyaret öncesi ölçü alma, model karşılaştırma ve iletişim için bir rehberdir. Fuar katılım tarihi, salon veya stant numarası paylaşılmadığından katılım duyurusu yapılmadı. Kesinleşen bilgiler geldiğinde sayfa gerçek bilgilerle güncellenebilir.

## Uygulanan teknik düzenlemeler

- 12 sayfanın her biri için ayrı başlık ve açıklama; doğru domain üzerinde canonical adresi, Open Graph ve Twitter paylaşım bilgileri.
- Ana içerik, başlıklar, ürün fotoğrafları ve gezinme bağlantıları derleme sırasında HTML'e yazılır. JavaScript kapalıyken de okunur. Galeri ve 3D tasarım gibi etkileşimler JavaScript gerektirir.
- Ortak `FurnitureStore`, `WebSite` ve `WebPage` verileri; alt sayfalarda `BreadcrumbList`, ürünlerde `Product`, koleksiyonda `ItemList`, rehberde `Article` JSON-LD verisi. Sayfa geçişlerinde aynı bilgiler güncellenir.
- Gerçek adres, Feyzi Yiğit'in telefonu ve bilinen sevkiyat ülkeleri kullanılır. Açılış saati, kesin mağaza koordinatı, fiyat, puan veya değerlendirme eklenmedi. Ürünlerde fiyat/yorum bilgisi bulunmadığından Google ürün zengin sonucu uygunluğu varsayılmamalıdır.
- `sitemap.xml` tüm 12 sayfayı ve ürün galerilerinin fotoğraflarını içerir; `robots.txt` bu haritaya işaret eder. Bulunamayan sayfa `noindex, follow` kullanır. Apache ayarı gerçek 404 sayfasına yöneliktir; hostingde HTTP durum kodu ayrıca doğrulanmalıdır.

Başlık/açıklamalar `src/data/seo.json`, ürün bilgileri `src/data/products.json`, firma bilgileri `src/data/company.json` içindedir. Ürün başlıkları ve yapılandırılmış veriler `src/seo.js`, statik HTML ve site haritası `scripts/generate-pages.mjs` tarafından üretilir. Başlık ve açıklamaları değiştirirken farklı sayfalara aynı metni kopyalamayın. Gereksiz anahtar kelime tekrarları veya gizli metin kullanmayın.

## Güzel Hosting'e yükleme

1. Bilgisayarınızda projenin ana klasöründe `git pull` ve `npm run build` çalıştırın.
2. Ana proje klasöründeki yeni **`dist` klasörünün içindekileri** yükleyin. `node_modules` içindeki `dist` klasörleri kullanılmaz.
3. cPanel'de domainin belge köküne (`public_html`) yeni `index.html`, `.htaccess`, `assets`, `sitemap.xml`, `robots.txt`, `404.html` ve tüm sayfa klasörlerini birlikte aktarın. `inegol-mobilya-fuari` klasörü de bulunmalıdır. Dosyalar `public_html/dist/` altında kalmamalıdır.
4. Canlı ana sayfa, `/inegol-mobilya-fuari`, bir ürün, `/sitemap.xml` ve `/robots.txt` adreslerini açın. Kaynak görüntüsünde sayfaya özel başlık, açıklama ve gerçek gövde içeriği bulunmalıdır. Bilinmeyen bir adresin HTTP 404 döndürdüğünü denetleyin.
5. Hosting panelinde HTTP ve `www` sürümlerini tercih edilen `https://alituranmob.com` adresine kalıcı olarak yönlendirin. DNS ve SSL kurulumuna uygunluğu hosting sağlayıcısıyla doğrulayın; canonical etiketi tek başına yönlendirme yapmaz.

Bu bulut ortamının çıkış proxy'si canlı alan adına bağlantıyı engelledi. Bu nedenle canlı sunucunun dosyaları, HTTP yönlendirmeleri, 404 durumu ve HTTPS yanıtları burada doğrulanamadı. Yerel üretim dosyaları üzerinde yapılan kontroller `VALIDATION.md` içindedir.

## Google'da yayımdan sonra yapılacaklar

1. [Google Search Console](https://search.google.com/search-console/) hesabında `alituranmob.com` için alan adı mülkü ekleyin. Google'ın verdiği DNS TXT kaydını alan adı DNS paneline girerek sahipliği doğrulayın. Hesabınızda daha önce doğrulanmışsa mevcut mülkü kullanın.
2. **Site Haritaları** bölümünde `https://alituranmob.com/sitemap.xml` adresini gönderin.
3. **URL Denetimi** ile ana sayfayı, rehberi ve dört ürün sayfasını kontrol edin. Google'ın canlı URL testini çalıştırıp uygunsa dizine ekleme isteyin. İstek göndermek dizine alınma veya belirli sıralama garantisi değildir.
4. Gerçek işletmeye ait [Google İşletme Profili](https://business.google.com/) mevcutsa onu yönetin; yoksa uygunluk ve sahiplik doğrulamasıyla oluşturun. Adı **Ali Turan Koltuk**, telefon **0530 346 8678**, adres **Mahmudiye, 7. Mobilya Sk. No:24, 16400 İnegöl/Bursa** ve web adresi siteyle tutarlı olsun. Çalışma saatlerini ancak doğrulanmış gerçek bilgilerle girin. Yeni mükerrer kayıt açmayın.
5. Search Console Performans bölümünde Türkiye / Web filtreleriyle marka sorgularını ve “İnegöl fuarı” gibi konuları izleyin. Sayfa dizine ekleme raporundaki hataları ve gerçek kullanıcıların mobil deneyimini kontrol edin. Siteye gerçek ürün, kumaş ve katılım bilgileri geldikçe ilgili sayfaları güncelleyin.

Search Console veya işletme profili hesabında işlem yapılmadı; erişim ve sahiplik doğrulaması kullanıcı hesabından tamamlanır. Bu çalışmada analiz/izleme kodu veya doğrulama anahtarı eklenmedi.
