# Görseller ve lisanslar

| Varlık                                                                                   | Kaynak / kullanım                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corner-01.webp`, `corner-02.webp`, `living-set-331.webp`, `fair-favorite-armchair.webp` | Site sahibinin `modeller.zip` dosyasında sağladığı dört ürün görseli. Sahneler değiştirilmeden WebP biçiminde optimize edilmiştir.                                                                                                                                                                |
| `public/assets/source-images/*.png`                                                      | ZIP'teki orijinal PNG dosyaları; dosya içerikleri değiştirilmeden korunmuştur.                                                                                                                                                                                                                    |
| `room-preview.webp`                                                                      | Sıla Model ölçülerine göre üretilmiş yaklaşık 3D oda yerleşimi; ürün fotoğrafı değildir.                                                                                                                                                                                                      |
| `favicon.svg`, arayüz ikonları                                                           | Bu projede oluşturulmuş özgün SVG çizimleri ve tipografi.                                                                                                                                                                                                                                         |
| `al-wolf.ico`, `al-wolf.png` | Site sahibinin sağladığı `AL Wolf Amblemi.ico`. ICO değiştirilmeden kullanılır; PNG aynı 32 × 32 px kareden kayıpsız aktarılmıştır. ICO tarayıcı faviconu olarak kullanılır; PNG önceki küçük amblem sürümüdür. |
| `public/assets/branding/ali-turan-logo.png` | Site sahibinin `ali_turan_logo_seffaf.zip` dosyasındaki orijinal 3000 × 750 px RGBA PNG; baytları değiştirilmeden korunmuştur. Üst menü, alt bilgi ve Organization logo alanında kullanılır. Ana sayfadaki büyük logo aynı PNG’nin `brightness(0) invert(1)` CSS filtresiyle beyaz gösterimidir; kaynak piksel verisi değişmez. |
| Cormorant Garamond                                                                       | Google Fonts; SIL Open Font License 1.1. Kaynak: https://github.com/google/fonts/tree/main/ofl/cormorantgaramond — lisans `public/assets/licenses/Cormorant-Garamond-OFL.txt`.                                                                                                                    |
| Manrope                                                                                  | Google Fonts; SIL Open Font License 1.1. Kaynak: https://github.com/google/fonts/tree/main/ofl/manrope — lisans `public/assets/licenses/Manrope-OFL.txt`.                                                                                                                                         |
| `land-110m.json`                                                                         | `world-atlas` paketi / Natural Earth 1:110m coğrafi veri. world-atlas: ISC, © Michael Bostock; Natural Earth harita verileri kamu malıdır. https://github.com/topojson/world-atlas ve https://www.naturalearthdata.com/about/terms-of-use/ — lisans `public/assets/licenses/world-atlas-ISC.txt`. |

Fontlar Google Fonts'tan HTTPS ile indirildi ve WOFF2 biçiminde yerelleştirildi. Üretim sürümünde dış font/görsel isteği veya stok görsel hotlink'i yapılmaz. Eski yapay zekâ ilham görselleri ve yedi örnek ürün renderı kaldırılmıştır. Fotoğrafların tedarikçisi site sahibidir; fotoğrafların üretim yöntemi hakkında ek iddiada bulunulmaz.

Kod bağımlılıkları: Three.js MIT, qrcode MIT, topojson-client ISC, Vite MIT; lisansları dağıtılan npm paketlerinin `LICENSE` dosyalarındadır. `world-atlas` yalnızca kaynak coğrafi veri içindir. Test araçları yalnızca geliştirmede kullanılır.

ZIP eşleştirmesi:

- `Sunlit Scandinavian Sectional Living Room.png` → `corner-01` (krem köşe).
- `Sunlit Luxury Living Room by the Water.png` → `corner-02` (bej köşe).
- `Luxe Charcoal Living Room Retreat.png` → `living-set-331` (antrasit 3+3+1).
- `Terracotta Armchair in a Sunlit Lounge.png` → `fair-favorite-armchair` (kiremit berjer).

`npm run render:assets` yalnızca oda önizlemesini üretir, ürün fotoğraflarını değiştirmez.

3D model geometrileri `src/three/photo-furniture.js` içinde, kullanıcının dört fotoğrafındaki biçimlere göre programatik olarak oluşturulmuştur. Kumaş mikro dokusu, döşeme deseni, ahşap damarı ve dekoratif yastık desenleri sentetik, yerel DataTexture verileridir; dış varlık indirilmez ve birebir kumaş taraması iddia edilmez. `docs/3d-models.png` bu geometrilerin Three.js ile gerçek renderlarını ürün fotoğraflarıyla karşılaştırır.

Nass Berjer’in gövdesi ayrıca kullanıcının paylaştığı dört ön/yan/arka fotoğrafa göre `src/three/nass-armchair.js` içinde yeniden oluşturulmuştur. `docs/nass-berjer-views.png` aynı etkileşimli geometrinin dört açıdan Three.js renderıdır. Yeni referans fotoğrafları bu işlemde ürün galerisine eklenmemiştir.

GPT-6 Astra’nın son modelleme geçişinde kullandığı dört orijinal JPEG, `WhatsApp Unknown 2026-10-15 at 13.48.21.zip` dosyasından alınmıştır. Astra her fotoğrafı doğrudan incelemiştir; dosyalar yalnızca geometri referansı olarak kullanılmıştır.

Oda zemininin meşe/ceviz parke, seramik ve beton desenleri `src/three/room-surfaces.js` içinde deterministik, yerel DataTexture olarak üretilir. Harici görsel veya gerçek malzeme taraması kullanılmaz. Kullanıcının seçtiği renklerle boyanır ve metre ölçeğinde tekrar eder. `docs/room-surfaces-*.png` gerçek oda tasarımcısından alınan örnek görüntülerdir.
