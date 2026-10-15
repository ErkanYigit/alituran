import {
  icon,
  escapeHTML as e,
  safeURL,
  responsiveAttrs,
  locationLabel,
  locationCategory,
  productNotice,
} from "../utils/ui.js";

export function productCard(p, index = 0) {
  return `<article class="product-card reveal"><div class="product-photo"><a href="/urun/${e(p.slug)}" aria-label="${e(p.name)} modelini incele"><img src="${e(p.images[0])}" ${responsiveAttrs(p.images[0])} alt="${e(p.name)} — ürün görseli" loading="lazy" width="900" height="700"></a>${p.badge ? `<span class="product-badge">${e(p.badge)}</span>` : `<span class="product-number">${String(index + 1).padStart(2, "0")}</span>`}<a class="room-action" href="/odani-tasarla?model=${e(p.id)}">${icon("box", 15)} Odanda Gör</a></div><div class="product-meta"><div><h3><a href="/urun/${e(p.slug)}">${e(p.name)}</a></h3><span class="product-category">${e(p.category)}</span></div><div class="swatches" aria-label="Görseldeki renk">${p.colors.map((c) => `<span class="swatch" style="background:${e(c.hex)}" title="${e(c.name)}"></span>`).join("")}</div></div><p>${e(p.description)}</p><a class="text-link" href="/urun/${e(p.slug)}">Modeli İncele ${icon("diagonal", 15)}</a></article>`;
}

export function home(company, products) {
  const heading = company.hero.heading.split("\n");
  const favorite = products.find((p) => p.badge) || products[0];
  const corner = products.find((p) => p.id === "corner-01");
  const set = products.find((p) => p.type === "set");
  const detailLabels = (labels, side) =>
    `<ul class="detail-labels ${side}">${labels.map((label, i) => `<li><span class="detail-dot"></span><span>${e(label)}</span><small>0${i + (side === "left" ? 1 : 4)}</small></li>`).join("")}</ul>`;
  return `<section class="hero wrap" aria-label="Fuarın Gözdesi berjer">
    <div class="hero-image"><img src="${e(company.hero.image)}" ${responsiveAttrs(company.hero.image, "(max-width:600px) calc(100vw - 36px), calc(100vw - 80px)")} alt="${e(company.hero.imageAlt)}" width="1374" height="1145" fetchpriority="high"></div>
    <div class="hero-copy"><span class="eyebrow">${e(company.hero.eyebrow)}</span><h1>${e(heading[0])}<br>${e(heading[1])}</h1><p>${e(company.hero.description)}</p><a class="btn hero-cta" href="/urun/${e(favorite.slug)}">Berjeri Keşfet <span class="button-arrow">${icon("arrow", 17)}</span></a></div>
    <a class="hero-sample sample-left" href="/urun/${e(corner.slug)}" aria-label="${e(corner.name)} modelini incele"><img src="${e(corner.images[0])}" ${responsiveAttrs(corner.images[0], "120px")} alt="" width="120" height="120"><span>Köşe koleksiyonu ${icon("diagonal", 13)}</span></a>
    <a class="hero-sample sample-right" href="/urun/${e(set.slug)}" aria-label="${e(set.name)} modelini incele"><img src="${e(set.images[0])}" ${responsiveAttrs(set.images[0], "150px")} alt="" width="150" height="150"><span>Bir arada, uyum içinde ${icon("diagonal", 13)}</span></a>
    <div class="hero-wordmark" aria-hidden="true">ali turan.</div>
    <div class="hero-bottom"><span>İNEGÖL'DEN YAŞAM ALANLARINA</span><a href="#detaylar" aria-label="Berjerin tasarım detaylarını keşfet">Detayları keşfet <span>${icon("chevron", 16)}</span></a><span>01 / 04</span></div>
  </section>
  <section class="home-panel details-panel" id="detaylar"><header class="details-heading reveal"><span class="eyebrow">01 / Tasarımın özü</span><h2>Her detayında<br>biraz <em>Ali Turan.</em></h2><p>Bir çizgi, bir doku, bir renk.<br>Fuarın Gözdesi'ni yakından keşfedin.</p></header>
    <div class="details-layout reveal">${detailLabels(["Yuvarlak sırt formu", "Kiremit tonları", "Ahşap detaylar"], "left")}<figure class="detail-portrait"><img src="${e(favorite.images[0])}" ${responsiveAttrs(favorite.images[0], "(max-width:600px) 80vw, 32vw")} alt="Fuarın Gözdesi berjerin yuvarlak hatları, kiremit döşemesi ve koyu ahşap detayları" width="320" height="400" loading="lazy"><figcaption>${e(favorite.name)} · Fuarın Gözdesi</figcaption></figure>${detailLabels(["Yumuşak hatlar", "Geniş oturum", "Dengeli oranlar"], "right")}
      <svg class="detail-connectors" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true" fill="none"><g stroke="currentColor" stroke-width=".8"><path d="M15 65 H285 L430 130"/><path d="M15 195 H285 L410 240"/><path d="M15 330 H285 L425 350"/><path d="M985 65 H715 L580 155"/><path d="M985 195 H715 L580 275"/><path d="M985 330 H715 L565 350"/></g><g fill="currentColor"><circle cx="430" cy="130" r="3"/><circle cx="410" cy="240" r="3"/><circle cx="425" cy="350" r="3"/><circle cx="580" cy="155" r="3"/><circle cx="580" cy="275" r="3"/><circle cx="565" cy="350" r="3"/></g></svg>
    </div><a class="text-link" href="/urun/${e(favorite.slug)}">Fuarın Gözdesi'ni İncele ${icon("diagonal", 17)}</a>
  </section>
  <section class="home-panel featured" id="koleksiyon"><div class="section-heading reveal"><div><span class="eyebrow">02 / Koleksiyon</span><h2>Birlikte güzel.<br><em>Size özel.</em></h2></div><div class="collection-intro"><p>İki köşe, bir takım ve fuarın gözdesi.<br>Yaşam alanınıza eşlik edecek modeli bulun.</p><a class="text-link" href="/koleksiyon">Koleksiyonu Keşfet ${icon("diagonal", 17)}</a></div></div><div class="product-grid">${products
    .filter((p) => p.featured)
    .map(productCard)
    .join(
      "",
    )}</div><p class="collection-note">${e(company.contentNotice)}</p></section>
  <section class="home-panel designer-teaser"><div class="reveal"><span class="eyebrow">03 / Sizin mekânınız</span><h2>Önce hayal et.<br><em>Sonra yerleştir.</em></h2><p>Odanızın ölçülerini belirleyin, modellerimizi yerleştirin. Size en uygun düzeni üç boyutlu olarak keşfedin.</p><a class="btn" href="/odani-tasarla">Odanı Tasarla <span class="button-arrow">${icon("arrow", 17)}</span></a><p class="notice">3D gösterimler ve ölçüler yaklaşık temsillerdir.</p></div><a class="room-preview reveal" href="/odani-tasarla" aria-label="3D oda tasarımcısını aç"><img src="/assets/images/room-preview.webp" ${responsiveAttrs("/assets/images/room-preview.webp", "(max-width:600px) 90vw, 45vw")} loading="lazy" alt="Köşe koltuk ve sehpanın örnek odadaki üç boyutlu yerleşimi" width="1000" height="800"><span class="preview-label">MEKÂNINIZ. SİZİN KOMPOZİSYONUNUZ.</span></a></section>
  <section class="home-panel global-teaser"><div class="globe-preview" id="home-globe"><div class="loading-3d">Dünya yükleniyor…</div></div><div class="reveal"><span class="eyebrow">04 / İnegöl'den dünyaya</span><h2>Konforun<br><em>sınırları yok.</em></h2><p>${e(company.exportStatement)}</p><a class="text-link" href="/dunyada-biz">Sevkiyat Yaptığımız Ülkeler ${icon("diagonal", 18)}</a><p class="notice">İnegöl'deki adresimiz ve sevkiyat ülkelerimizi keşfedin.</p></div></section>
  <section class="home-panel contact-teaser"><span class="eyebrow">Bir sohbetle başlayalım</span><h2>Size bir <em>yer ayıralım.</em></h2><p>${e(company.contactPerson)} · ${e(company.phoneDisplay)}</p><a class="btn" href="/iletisim">Bizimle İletişime Geç <span class="button-arrow">${icon("arrow", 17)}</span></a></section>`;
}

export function collection(company, products) {
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Yaşamınıza eşlik eden tasarımlar</span><h1>Bir arada, <em>uyum içinde.</em></h1><p>Her mekânın kendine ait bir ritmi var. Size ilham veren modeli keşfedin.</p></header><div class="catalog-controls"><div class="filter-tabs" aria-label="Ürün kategorileri">${["Tümü", ...new Set(products.map((p) => p.category))].map((c, i) => `<button data-category="${e(c)}" aria-pressed="${i === 0}">${e(c)}</button>`).join("")}</div><label class="search-field">${icon("search", 18)}<input id="product-search" type="search" placeholder="Bir model arayın…" aria-label="Ürün ara"></label></div><p id="catalog-count" class="catalog-results" aria-live="polite">${products.length} model</p><div class="product-grid catalog-grid" id="catalog-grid">${products.map(productCard).join("")}</div><p class="notice">${e(company.contentNotice)}</p></div>`;
}

function productDimensions(p) {
  const rows = p.components || [
    { name: p.name, quantity: 1, dimensions: p.dimensions },
  ];
  const multiple = !!p.components;
  return `<table class="dimension-table"><caption class="detail-label">${p.dimensionStatus === "estimated" ? "Tahmini ölçüler" : "Ölçüler"}${multiple ? " · parça başına" : ""}</caption><thead><tr>${multiple ? '<th scope="col">Parça</th>' : ""}<th scope="col">Genişlik (X)</th><th scope="col">Derinlik (Z)</th><th scope="col">Yükseklik (Y)</th></tr></thead><tbody>${rows.map((item) => `<tr>${multiple ? `<th scope="row">${item.quantity} × ${e(item.name)}</th>` : ""}<td>${item.dimensions.width} cm</td><td>${item.dimensions.depth} cm</td><td>${item.dimensions.height} cm</td></tr>`).join("")}</tbody></table>`;
}

export function productPage(company, p, products) {
  return `<div class="wrap"><nav class="breadcrumb" aria-label="Sayfa yolu"><a href="/">Ana Sayfa</a>${icon("chevron", 12)}<a href="/koleksiyon">Koleksiyon</a>${icon("chevron", 12)}<span>${e(p.name)}</span></nav><section class="product-detail"><div><div class="gallery-main"><img id="gallery-image" src="${e(p.images[0])}" ${responsiveAttrs(p.images[0], "(max-width:600px) 90vw, 55vw")} alt="${e(p.name)} ürün görseli" width="900" height="700" fetchpriority="high"></div><div class="gallery-thumbs" aria-label="Ürün görselleri">${p.images.map((src, i) => `<button data-image="${e(src)}" aria-label="Görsel ${i + 1}: ${e(p.name)}" aria-pressed="${i === 0}"><img src="${e(src)}" ${responsiveAttrs(src, "85px")} alt="" width="85" height="70" loading="lazy"></button>`).join("")}</div><p class="notice">Ürün görselleri Ali Turan Koltuk tarafından sağlanmıştır. 3D gösterimler yaklaşık temsillerdir.</p></div><div class="detail-copy"><span class="eyebrow">${e(p.category)}</span><h1>${e(p.name)}</h1><p class="description">${e(p.description)}</p>${p.badge ? `<span class="demo-badge">${e(p.badge)}</span>` : ""}${p.composition ? `<p class="set-composition">${e(p.composition)} · 2 üçlü kanepe + 1 berjer</p>` : ""}<div class="detail-label"><span>Görseldeki renk</span><span id="color-name">${e(p.colors[0].name)}</span></div><div class="color-picker">${p.colors.map((c, i) => `<button data-color="${e(c.hex)}" data-name="${e(c.name)}" style="background:${e(c.hex)}" aria-label="${e(c.name)} rengi" aria-pressed="${i === 0}"></button>`).join("")}</div>${productDimensions(p)}<p class="notice">${e(productNotice(p))} Ölçüler ve kumaş seçenekleri için bizimle iletişime geçin.</p><div class="actions"><a id="product-room-link" class="btn" href="/odani-tasarla?model=${e(p.id)}&color=${encodeURIComponent(p.colors[0].hex)}">Odanda Gör ${icon("box", 18)}</a><a class="btn outline" href="/iletisim">İletişime Geç ${icon("arrow", 18)}</a></div><button class="qr-action" id="open-qr">${icon("qr", 19)} QR Kodu Göster</button></div></section><section class="detail-features"><article><span class="section-label">01 / TASARIM</span><h3>Sakin bir karakter.</h3><p>${e(p.description)}</p></article><article><span class="section-label">02 / DOKU</span><h3>Dokunarak keşfet.</h3><p>Fotoğraftaki renk gösterilmektedir. Mevcut kumaş ve renk seçeneklerini bizimle görüşebilirsiniz.</p></article><article><span class="section-label">03 / MEKÂN</span><h3>Yerini hayal et.</h3><p>Tahmini ölçülerle odanızdaki yerleşimini deneyin; kesin ölçüleri bizimle doğrulayın.</p></article></section><section class="exploded-section"><div class="exploded-layout"><div><span class="eyebrow">Tasarımı keşfet</span><h2>Bütünün<br><em>küçük parçaları.</em></h2><p>Oturum, sırt, kol ve ayaklar… Parçaların bir araya gelişini etkileşimli bir gösterimde izleyin.</p><p class="notice">Bu prosedürel animasyon, gerçek ürünün iç yapısını veya üretim tekniğini göstermez.</p></div><div id="exploded-host"><div class="exploded-canvas" id="exploded-canvas"><div class="loading-3d">Gösterim yükleniyor…</div></div><div class="exploded-controls"><button id="explode-play" aria-label="Animasyonu oynat">${icon("play", 17)}</button><button id="explode-pause" aria-label="Animasyonu duraklat">${icon("pause", 17)}</button><button id="explode-reverse" aria-label="Animasyonu tersine oynat">${icon("rotate", 17)}</button><button id="explode-restart" aria-label="Animasyonu yeniden başlat">${icon("reset", 17)}</button><input id="explode-progress" aria-label="Ayrılma ilerlemesi" type="range" min="0" max="1" step="0.01" value="0"></div></div></div></section><section class="featured"><div class="section-heading"><div><span class="eyebrow">Aynı hikâyenin farklı çizgileri</span><h2>Bir de bunlara <em>bakın.</em></h2></div></div><div class="product-grid">${products
    .filter((x) => x.id !== p.id)
    .slice(0, 3)
    .map(productCard)
    .join("")}</div></section></div>`;
}

export function about(company) {
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Ali Turan'a dair</span><h1>Yaşama alan açan<br><em>bir tasarım dili.</em></h1></header><section class="story-hero"><img src="/assets/images/corner-02.webp" ${responsiveAttrs("/assets/images/corner-02.webp", "(max-width:600px) 90vw, 50vw")} alt="Sıla Model — bej köşe koltuk" width="1536" height="1024"><div><span class="eyebrow">Birlikte şekillenen hikâye</span><h2>Mekânı değil,<br><em>hissi tasarlamak.</em></h2><p>${e(company.introduction)}</p><p>${e(company.story || "Şirketin kuruluş hikâyesi ve kurumsal tanıtımı firma tarafından paylaşılacaktır. Bu bölüm onaylanmış bilgilerle güncellenecektir.")}</p><a class="text-link" href="/koleksiyon">Koleksiyonu Keşfet ${icon("diagonal", 17)}</a></div></section><section class="story-grid"><article><span class="section-label">01 / FELSEFE</span><h3>Yalınlığın gücü.</h3><p>Bu seçkinin tasarım yönü; zamansız çizgiler, doğal tonlar ve yaşamla kurulan sade bir ilişkiden ilham alır.</p></article><article><span class="section-label">02 / ÜRETİM</span><h3>Hikâyenin atölyesi.</h3><p>${e(company.production || "Üretim yaklaşımı, atölye fotoğrafları ve doğrulanmış teknik bilgiler firma tarafından eklenecektir.")}</p></article><article><span class="section-label">03 / DÜNYADA BİZ</span><h3>İnegöl’den dünyaya.</h3><p>${e(company.exportStatement || "Ürün geliştirme süreci ve gerçek koleksiyon hikâyeleri, onaylı içerikler sağlandığında burada yer alacaktır.")}</p></article></section></div>`;
}

export function contact(company) {
  const phone = company.phone
    ? `tel:${company.phone.replace(/[^+\d]/g, "")}`
    : "";
  const email =
    company.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)
      ? `mailto:${company.email}`
      : "";
  const whatsapp = company.whatsapp
    ? `https://wa.me/${company.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Merhaba, Ali Turan Koltuk ürünleri ve sevkiyat hakkında bilgi almak istiyorum.")}`
    : "";
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">${e(company.name)} · İnegöl / Bursa</span><h1>Bir sohbetle<br><em>başlayalım.</em></h1><p>Ürünler, renkler ve yurt dışı sevkiyat hakkında bilgi almak için ${e(company.contactPerson || "bizimle")} ile iletişime geçin.</p></header><section class="contact-layout"><div><div class="contact-list"><article>${icon("pin", 23)}<h3>Adresimiz</h3><p>${e(company.address || "Adres bilgisi paylaşılacak.")}</p><p class="notice">${e(company.showroomHours || "Ziyaret öncesi telefonla iletişime geçebilirsiniz.")}</p></article><article>${icon("globe", 23)}<h3>Telefon</h3><p>${e(company.contactPerson || "")}</p><p>${phone ? `<a href="${e(phone)}">${e(company.phoneDisplay || company.phone)}</a>` : "Telefon bilgisi paylaşılacak."}</p>${phone ? `<a class="text-link" href="${e(phone)}">Telefonla Ara ${icon("arrow", 15)}</a>` : ""}</article><article>${icon("mail", 23)}<h3>WhatsApp</h3><p>${e(company.contactPerson || "")} ile ürün ve sevkiyat bilgilerini görüşebilirsiniz.</p>${whatsapp ? `<a class="btn outline" href="${e(whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp'tan Yazın — ${e(company.contactPerson || company.name)}">WhatsApp'tan Yazın ${icon("diagonal", 15)}</a>` : '<p class="notice">WhatsApp numarası paylaşılacak.</p>'}</article><article>${icon("box", 23)}<h3>Yurt Dışı Sevkiyat</h3><p>${e(company.exportStatement || "Sevkiyat hakkında bilgi almak için iletişime geçin.")}</p></article>${email ? `<article>${icon("mail", 23)}<h3>E-posta</h3><a class="text-link" href="${e(email)}">${e(company.email)} ${icon("arrow", 15)}</a></article>` : ""}${
    company.socials.length
      ? `<article><h3>Sosyal Medya</h3>${company.socials
          .filter((s) => safeURL(s.url))
          .map(
            (s) =>
              `<a class="text-link" href="${e(safeURL(s.url))}" target="_blank" rel="noopener">${e(s.label)} ${icon("diagonal", 14)}</a>`,
          )
          .join("")}</article>`
      : ""
  }</div><p class="notice">Ziyaret, ürün seçenekleri ve sevkiyat detayları için telefon veya WhatsApp üzerinden bize ulaşabilirsiniz.</p></div><div class="contact-map">${icon("pin", 36)}<h3>İnegöl’de buluşalım.</h3><p>${e(company.address || "Adres bilgisi paylaşılacak.")}</p>${safeURL(company.mapUrl) ? `<a class="text-link" href="${e(safeURL(company.mapUrl))}" rel="noopener" target="_blank">Haritada Aç ${icon("diagonal", 17)}</a>` : ""}</div></section></div>`;
}

export function world(company, locations) {
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Dünyada ${e(company.name)}</span><h1>Tasarımın <em>sınırları yok.</em></h1><p>${e(company.exportStatement || "Farklı coğrafyalar, ortak bir yaşam kültürü.")}</p></header><section class="world-layout"><div class="world-canvas" id="world-canvas"><span class="canvas-label">Sürükleyerek keşfedin</span><div class="loading-3d">Dünya yükleniyor…</div><div class="globe-controls"><button class="icon-button" id="globe-in" aria-label="Küreye yaklaş">${icon("plus", 18)}</button><button class="icon-button" id="globe-out" aria-label="Küreden uzaklaş">${icon("minus", 18)}</button><button class="icon-button" id="globe-reset" aria-label="Küre görünümünü sıfırla">${icon("reset", 18)}</button></div></div><div class="world-copy"><span class="eyebrow">İnegöl’den dünyaya</span><h2>Yaşamın her<br><em>köşesine ilham.</em></h2><p>${e(company.exportStatement || "")}</p><p class="notice">Sevkiyat işaretleri ülke genelini temsil eder. İnegöl’deki açık adresimiz için iletişim sayfamızı ziyaret edebilirsiniz.</p><div class="location-list">${locations.map((l) => `<button data-location="${e(l.id)}">${icon("pin", 19)}<span>${e(locationLabel(l))}<small>${e(locationCategory(l))}</small></span>${icon("diagonal", 15)}</button>`).join("")}</div><div class="location-info" id="location-info" aria-live="polite"><p>Bir işaret seçerek konum açıklamasını görüntüleyin.</p></div></div></section></div>`;
}

export function privacy() {
  return `<article class="privacy"><span class="eyebrow">Gizlilik bilgileri</span><h1>Sizin alanınız,<br><em>sizin tercihiniz.</em></h1><p>Bu statik site hesap, ödeme veya sunucuya mesaj gönderen form içermez. Analitik ve reklam takip kodu kullanılmaz.</p><h2>Oda tasarımları</h2><p>Oda tasarımını kaydettiğinizde, ölçüler ve yerleşim yalnızca tarayıcınızın yerel depolama alanında tutulur. Şirkete gönderilmez. Tasarımcıdaki “Kaydı Sil” seçeneğiyle kaldırabilirsiniz.</p><h2>Görseller ve yazı tipleri</h2><p>Görseller, katalog verileri ve yazı tipleri bu sitenin dosyalarından yüklenir. Dışarıdan yazı tipi veya stok fotoğraf isteği yapılmaz.</p><h2>Dış bağlantılar</h2><p>İletişim bilgileri eklendiğinde, e-posta ve WhatsApp bağlantıları kendi uygulamalarınızı veya ilgili sağlayıcının sitesini açar. Bu hizmetlerin gizlilik koşulları ayrıca geçerlidir.</p><h2>Barındırma bilgileri</h2><p>Barındırma sağlayıcısı teknik erişim kayıtları tutabilir. Veri sorumlusu, iletişim bilgileri ve barındırma sağlayıcısına ilişkin resmî aydınlatma metni firma tarafından tamamlanmalıdır.</p></article>`;
}
