# Doğrulama — 14 Ekim 2026

- Node.js 24.19.0; kilit dosyasıyla `npm ci` kurulumu tekrar doğrulandı.
- Üretim derlemesi geçti; 11 bağımsız sayfa, sitemap ve robots dosyaları üretildi.
- 8 birim testi geçti; sıfır başarısız/atlanmış test.
- 15 gerçek Chromium tarayıcı senaryosu geçti; sıfır başarısız/atlanmış senaryo.
- QR PNG dosyası gerçek QR çözümleme kütüphanesiyle okunup canonical ürün adresi doğrulandı.
- Mouse ve gerçek touch olaylarıyla mobilya sürükleme doğrulandı.
- Oda işlemleri, kaydet/aç/sil, PNG görüntü indirme, doğrudan URL yenileme, WebGL fallback, küre coğrafi dokusu ve animasyon kontrolleri doğrulandı.
- Yedi normal içerik sayfasında, azaltılmış hareket tercihiyle yapılan axe WCAG A/AA taramasında ihlal bulunmadı. Bu otomatik tarama tek başına tüm erişilebilirlik koşulları için sertifika değildir.

## Git'ten yeni indirilen projede geliştirme görselleri

Görsel türevleri ve `dist/` olmadan hazırlanan temiz Git dosyalarında eski `npm run dev` başlangıcıyla eksik görsel sorunu tekrarlandı. `predev` düzeltmesinden sonra, derleme çalıştırmadan 20 WebP türevi otomatik oluşturuldu. Gerçek Chromium'da ana sayfa, koleksiyon ve 3+3+1 ürün sayfasındaki toplam 32 görsel yüklemesi masaüstü (1440 px) ve mobil (390 px) genişliklerde doğrulandı; eksik görsel kalmadı. Kontrol mevcut kurulu bağımlılıkları kullandı; yeniden bağımlılık kurulumu bu kontrolde denenmedi.

## Mobil Lighthouse

Aşağıdaki ölçüm önceki örnek katalog sürümünde yapıldı; bu dört ürünlük sürüm için Lighthouse yeniden çalıştırılmadı. Önceki yerel üretim dosyalarında Lighthouse 12.8.2'nin varsayılan mobil benzetimiyle ölçüldü. Temel Python statik sunucusu HTTP sıkıştırma ve üretim cache başlıkları sağlamaz; canlı barındırma koşulları ayrıca ölçülmelidir.

- performance: 87/100
- accessibility: 100/100
- best-practices: 100/100
- seo: 100/100

Tam Lighthouse raporu bu çalışma ortamında `/workspace/scratch/alituran-lighthouse.json` dosyasındadır.

## Yayım öncesi gerçek içerikler

Katalogda yalnızca kullanıcı tarafından sağlanan dört model vardır: Fuarın Gözdesi berjer, iki köşe koltuk ve 3+3+1 takım. Model isimleri geçici, ölçüler tahminidir. Dört orijinal PNG dosyası ZIP içerikleriyle SHA-256 karşılaştırmasında eşleşmiştir. Ana sayfa ve katalog sırası, fotoğraf eşleştirmesi, takımın parça ölçüleri ve üç bağımsız mobilya olarak kaydedilip geri yüklenmesi tarayıcıda doğrulanmıştır. 3D modeller yaklaşık yerleşim temsilleridir. Ali Turan Koltuk adı, İnegöl adresi, Feyzi Yiğit’in telefon/WhatsApp numarası ve Almanya/Avusturya/Kosova sevkiyat bilgileri site sahibi tarafından sağlanmıştır. Küredeki işaretler ülke ve ilçe genelini temsil eder. Telefon, WhatsApp ve Google Maps hedefleri tarayıcı testinde doğrulandı. Gerçek ürün GLB dosyaları, fiziksel cihazlar ve canlı domain DNS/HTTPS ayrıca doğrulanmalıdır. Halka açık site yayımı ve DNS değişikliği yapılmadı. Yayımlama ve içerik düzenleme adımları README.md içindedir.
