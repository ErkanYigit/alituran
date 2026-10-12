# Doğrulama — 12 Ekim 2026

- Node.js 24.19.0; kilit dosyasıyla `npm ci` kurulumu tekrar doğrulandı.
- Üretim derlemesi geçti; 14 bağımsız sayfa, sitemap ve robots dosyaları üretildi.
- 7 birim testi geçti; sıfır başarısız/atlanmış test.
- 13 gerçek Chromium tarayıcı senaryosu geçti; sıfır başarısız/atlanmış senaryo.
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

Ürünler, ölçüler, renkler, görseller ve mobilya modelleri açıkça etiketlenmiş örneklerdir. Ali Turan Koltuk adı, İnegöl adresi, Feyzi Yiğit’in telefon/WhatsApp numarası ve Almanya/Avusturya/Kosova sevkiyat bilgileri site sahibi tarafından sağlanmıştır. Küredeki işaretler ülke ve ilçe genelini temsil eder. Telefon, WhatsApp ve Google Maps hedefleri tarayıcı testinde doğrulandı. Gerçek ürün GLB dosyaları, fiziksel cihazlar ve canlı domain DNS/HTTPS ayrıca doğrulanmalıdır. Halka açık site yayımı ve DNS değişikliği yapılmadı. Yayımlama ve içerik düzenleme adımları README.md içindedir.
