import { escapeHTML as e, icon, safeURL } from "../utils/ui.js";

export function siteShell(company, products, navigation, content = "") {
  const wordmark = `<span class="brand-logo"><img class="brand-wordmark" src="/assets/branding/ali-turan-logo.png" alt="${e(company.name)}" width="3000" height="750"></span>`;
  const headerNavigation = [
    ...navigation.filter((n) => n.path !== "/koleksiyon"),
    navigation.find((n) => n.path === "/koleksiyon"),
  ];
  return `<header class="site-header"><a href="/" aria-label="${e(company.wordmark || company.name)} ${e(company.subtitle)} — Ana Sayfa">${wordmark}</a><nav class="nav" id="navigation" aria-label="Ana menü">${headerNavigation.map((n) => `<a href="${n.path}" class="${n.path === "/koleksiyon" ? "catalog-nav" : ""}">${n.label}${n.path === "/koleksiyon" ? `<span class="nav-arrow">${icon("arrow", 15)}</span>` : ""}</a>`).join("")}</nav><button class="menu-button icon-button" id="menu-toggle" aria-controls="navigation" aria-expanded="false" aria-label="Menüyü aç">${icon("menu")}</button><button class="menu-backdrop" aria-label="Menüyü kapat" tabindex="-1"></button></header><main id="main" tabindex="-1">${content}</main><footer class="site-footer wrap"><div class="footer-main"><div class="footer-brand"><a href="/">${wordmark}</a><p>${e(company.footerDescription || company.introduction)}</p></div><div><div class="footer-title">Keşfedin</div><div class="footer-links">${[
    ...navigation,
    { label: "İnegöl Fuarı Rehberi", path: "/inegol-mobilya-fuari" },
  ]
    .filter((n) => n.path !== "/")
    .map((n) => `<a href="${n.path}">${n.label}</a>`)
    .join(
      "",
    )}</div></div><div><div class="footer-title">Koleksiyon</div><div class="footer-links">${products
    .filter((p) => p.featured)
    .slice(0, 4)
    .map((p) => `<a href="/urun/${p.slug}">${e(p.name)}</a>`)
    .join(
      "",
    )}</div></div><div><div class="footer-title">Tanışalım</div><p class="footer-note">${e(company.address || "Showroom ve iletişim bilgileri firma tarafından paylaşılacak.")}</p>${company.phone ? `<p class="footer-note">${e(company.contactPerson || "")}<br><a href="tel:${e(company.phone.replace(/[^+\d]/g, ""))}">${e(company.phoneDisplay || company.phone)}</a></p>` : ""}<a class="text-link" href="/iletisim">İletişim Bilgileri ${icon("diagonal", 16)}</a>${
    company.socials.length
      ? `<div class="footer-social">${company.socials
          .filter((s) => safeURL(s.url))
          .map(
            (s) =>
              `<a href="${e(safeURL(s.url))}" target="_blank" rel="noopener">${e(s.label)}</a>`,
          )
          .join("")}</div>`
      : ""
  }</div></div><div class="footer-signature" aria-hidden="true"><img src="/assets/branding/ali-turan-logo.png" alt="" width="3000" height="750" loading="lazy"></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${e(company.name)}</span><span>İnegöl’den dünyaya</span><a href="/gizlilik">Gizlilik Bilgileri</a></div></footer>`;
}
