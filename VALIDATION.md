# Doğrulama — 12 Ekim 2026

- Node.js 24.19.0; kilit dosyasıyla `npm ci` kurulumu tekrar doğrulandı.
- Üretim derlemesi geçti; 14 bağımsız sayfa, sitemap ve robots dosyaları üretildi.
- 7 birim testi geçti; sıfır başarısız/atlanmış test.
- 12 gerçek Chromium tarayıcı senaryosu geçti; sıfır başarısız/atlanmış senaryo.
- QR PNG dosyası gerçek QR çözümleme kütüphanesiyle okunup canonical ürün adresi doğrulandı.
- Mouse ve gerçek touch olaylarıyla mobilya sürükleme doğrulandı.
- Oda işlemleri, kaydet/aç/sil, PNG görüntü indirme, doğrudan URL yenileme, WebGL fallback, küre coğrafi dokusu ve animasyon kontrolleri doğrulandı.
- Altı normal içerik sayfasında, azaltılmış hareket tercihiyle yapılan axe WCAG A/AA taramasında ihlal bulunmadı. Bu otomatik tarama tek başına tüm erişilebilirlik koşulları için sertifika değildir.

## Mobil Lighthouse

Yerel üretim dosyalarında Lighthouse 12.8.2'nin varsayılan mobil benzetimiyle ölçüldü. Temel Python statik sunucusu HTTP sıkıştırma ve üretim cache başlıkları sağlamaz; canlı barındırma koşulları ayrıca ölçülmelidir.

- performance: 87/100
- accessibility: 100/100
- best-practices: 100/100
- seo: 100/100

Tam Lighthouse raporu bu çalışma ortamında `/workspace/scratch/alituran-lighthouse.json` dosyasındadır.

## Yayım öncesi gerçek içerikler

Mevcut ürünler, ölçüler, renkler, görseller, mobilya modelleri ve İstanbul işareti açıkça etiketlenmiş örneklerdir. Gerçek ürün GLB dosyaları ve fiziksel cihazlarda QR/tarayıcı kontrolleri, firma bilgileri, domain DNS/HTTPS ve canlı hosting henüz doğrulanmadı. Halka açık site yayımı ve DNS değişikliği yapılmadı. Yayımlama ve içerik düzenleme adımları README.md içindedir.
