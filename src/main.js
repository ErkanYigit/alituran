import "./styles/main.css";
import "./styles/reference.css";
import products from "./data/products.json";
import company from "./data/company.json";
import navigation from "./data/navigation.json";
import locations from "./data/locations.json";
import {
  home,
  collection,
  productPage,
  productCard,
  about,
  contact,
  world,
  privacy,
} from "./pages/content.js";
import {
  icon,
  escapeHTML as e,
  toast,
  download,
  canonicalProduct,
  safeURL,
  imageSrcset,
} from "./utils/ui.js";

const wordmark = `<span class="brand-logo"><img class="brand-wordmark" src="/assets/branding/ali-turan-logo.png" alt="${e(company.name)}" width="3000" height="750"></span>`;
const headerNavigation = [
  ...navigation.filter((n) => n.path !== "/koleksiyon"),
  navigation.find((n) => n.path === "/koleksiyon"),
];
document.querySelector("#app").innerHTML =
  `<header class="site-header"><a href="/" aria-label="${e(company.wordmark || company.name)} ${e(company.subtitle)} — Ana Sayfa">${wordmark}</a><nav class="nav" id="navigation" aria-label="Ana menü">${headerNavigation.map((n) => `<a href="${n.path}" class="${n.path === "/koleksiyon" ? "catalog-nav" : ""}">${n.label}${n.path === "/koleksiyon" ? `<span class="nav-arrow">${icon("arrow", 15)}</span>` : ""}</a>`).join("")}</nav><button class="menu-button icon-button" id="menu-toggle" aria-controls="navigation" aria-expanded="false" aria-label="Menüyü aç">${icon("menu")}</button><button class="menu-backdrop" aria-label="Menüyü kapat" tabindex="-1"></button></header><main id="main" tabindex="-1"></main><footer class="site-footer wrap"><div class="footer-main"><div class="footer-brand"><a href="/">${wordmark}</a><p>${e(company.footerDescription || company.introduction)}</p></div><div><div class="footer-title">Keşfedin</div><div class="footer-links">${navigation
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
const main = document.querySelector("#main");
let cleanups = [],
  routeId = 0;
let revealObserver;
function observeReveals() {
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.05 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
}
function closeMenu() {
  document.querySelector(".nav").classList.remove("open");
  document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
  document
    .querySelector("#menu-toggle")
    .setAttribute("aria-label", "Menüyü aç");
  document.querySelector("#menu-toggle").innerHTML = icon("menu");
}
document.querySelector("#menu-toggle").onclick = () => {
  const open = document.querySelector(".nav").classList.toggle("open");
  document
    .querySelector("#menu-toggle")
    .setAttribute("aria-expanded", String(open));
  document
    .querySelector("#menu-toggle")
    .setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  document.querySelector("#menu-toggle").innerHTML = icon(
    open ? "close" : "menu",
  );
  if (open) document.querySelector(".nav a").focus();
};
document.querySelector(".menu-backdrop").onclick = closeMenu;
document.addEventListener("keydown", (event) => {
  if (!document.querySelector(".nav").classList.contains("open")) return;
  if (event.key === "Escape") {
    closeMenu();
    document.querySelector("#menu-toggle").focus();
  }
  if (event.key === "Tab") {
    const items = [
      ...document.querySelectorAll(".nav a"),
      document.querySelector("#menu-toggle"),
    ];
    const first = items[0],
      last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener(
  "scroll",
  () =>
    document
      .querySelector(".site-header")
      .classList.toggle("scrolled", window.scrollY > 30),
  { passive: true },
);

function setMetadata(title, description, path, image = company.hero.image) {
  document.title = `${title} — ${company.name}`;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('link[rel="canonical"]').href =
    `${company.domain}${path}`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content =
    description;
  document.querySelector('meta[property="og:url"]').content =
    `${company.domain}${path}`;
  document.querySelector('meta[property="og:image"]').content =
    `${company.domain}${image}`;
}
function collectionEvents() {
  let category = "Tümü";
  const update = () => {
    const query = document
      .querySelector("#product-search")
      .value.trim()
      .toLocaleLowerCase("tr-TR");
    const filtered = products.filter(
      (p) =>
        (category === "Tümü" || p.category === category) &&
        `${p.name} ${p.category} ${p.description}`
          .toLocaleLowerCase("tr-TR")
          .includes(query),
    );
    document.querySelector("#catalog-grid").innerHTML = filtered.length
      ? filtered.map(productCard).join("")
      : '<p class="empty-state">Bu aramaya uygun bir model bulunamadı. Farklı bir isim veya kategori deneyin.</p>';
    document.querySelector("#catalog-count").textContent =
      `${filtered.length} model`;
    observeReveals();
  };
  document.querySelectorAll("[data-category]").forEach(
    (btn) =>
      (btn.onclick = () => {
        category = btn.dataset.category;
        document
          .querySelectorAll("[data-category]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        update();
      }),
  );
  document.querySelector("#product-search").oninput = update;
}
async function productEvents(p, id) {
  document.querySelectorAll("[data-image]").forEach(
    (btn) =>
      (btn.onclick = () => {
        document.querySelector("#gallery-image").src = btn.dataset.image;
        document.querySelector("#gallery-image").srcset = imageSrcset(
          btn.dataset.image,
        );
        document.querySelector("#gallery-image").alt =
          `${p.name} — ürün görseli`;
        document
          .querySelectorAll("[data-image]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      }),
  );
  document.querySelectorAll("[data-color]").forEach(
    (btn) =>
      (btn.onclick = () => {
        document.querySelector("#color-name").textContent = btn.dataset.name;
        document
          .querySelectorAll("[data-color]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        document.querySelector("#product-room-link").href =
          `/odani-tasarla?model=${p.id}&color=${encodeURIComponent(btn.dataset.color)}`;
        document.dispatchEvent(
          new CustomEvent("product-color", { detail: btn.dataset.color }),
        );
      }),
  );
  document.querySelector("#open-qr").onclick = async () => {
    const dialog = document.querySelector("#qr-dialog");
    const url = canonicalProduct(company, p);
    dialog.innerHTML = `<button class="dialog-close icon-button" aria-label="QR penceresini kapat">${icon("close", 18)}</button><div class="qr-content"><h2 id="qr-title">${e(p.name)}</h2><p>Bu modeli telefonunuzda keşfedin.</p><div class="qr-code" id="qr-code" role="img" aria-label="${e(p.name)} ürün bağlantısının QR kodu" aria-busy="true"><span>QR kodu hazırlanıyor…</span></div><a class="qr-url" href="${e(url)}" target="_blank" rel="noopener">${e(url)}</a><button class="btn" id="qr-save" disabled>PNG İndir (2048 × 2048) ${icon("save", 16)}</button></div>`;
    const frame = dialog.querySelector("#qr-code");
    const save = dialog.querySelector("#qr-save");
    dialog.querySelector(".dialog-close").onclick = () => dialog.close();
    dialog.showModal();
    try {
      const QRCode = await import("qrcode");
      const options = {
        margin: 4,
        errorCorrectionLevel: "H",
        color: { dark: "#352b25", light: "#ffffff" },
      };
      const svg = await QRCode.default.toString(url, {
        ...options,
        type: "svg",
      });
      if (!dialog.open || !dialog.contains(frame)) return;
      frame.innerHTML = svg;
      frame.querySelector("svg").setAttribute("aria-hidden", "true");
      frame.setAttribute("aria-busy", "false");
      // Export independently: the library fixes canvas CSS dimensions to its
      // bitmap size, which must never control the responsive on-screen code.
      // Integer module pixels avoid both blur and the library's fractional
      // width rounding (a requested 2048px may otherwise become 2047px).
      const symbol = QRCode.default.create(url, options);
      const scale = Math.floor(
        2048 / (symbol.modules.size + options.margin * 2),
      );
      const bitmap = document.createElement("canvas");
      await QRCode.default.toCanvas(bitmap, url, { ...options, scale });
      const file = document.createElement("canvas");
      file.width = file.height = 2048;
      const context = file.getContext("2d");
      context.fillStyle = options.color.light;
      context.fillRect(0, 0, 2048, 2048);
      context.drawImage(
        bitmap,
        Math.floor((2048 - bitmap.width) / 2),
        Math.floor((2048 - bitmap.height) / 2),
      );
      const png = file.toDataURL("image/png");
      if (!dialog.open || !dialog.contains(frame)) return;
      save.onclick = () => download(png, `ali-turan-${p.id}-qr.png`);
      save.disabled = false;
    } catch {
      if (!dialog.open || !dialog.contains(frame)) return;
      frame.setAttribute("aria-busy", "false");
      if (!frame.querySelector("svg"))
        frame.textContent = "QR kodu hazırlanamadı.";
      dialog.querySelector("p").textContent =
        "QR dosyası hazırlanamadı. Ürün bağlantısını kullanabilirsiniz.";
      save.disabled = true;
    }
  };
  const host = document.querySelector("#exploded-canvas");
  let disposed = false;
  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries.some((x) => x.isIntersecting)) return;
      observer.disconnect();
      try {
        const { mountExploded } = await import("./three/exploded.js");
        if (disposed || id !== routeId) return;
        const dispose = await mountExploded(host, p);
        if (disposed || id !== routeId) dispose();
        else cleanups.push(dispose);
      } catch {
        if (!disposed)
          host.innerHTML =
            '<p class="webgl-fallback">3D gösterim yüklenemedi. Diğer ürün bilgilerini inceleyebilirsiniz.</p>';
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(host);
  cleanups.push(() => {
    disposed = true;
    observer.disconnect();
  });
}
async function render(focus = false) {
  const id = ++routeId;
  cleanups.forEach((fn) => fn());
  cleanups = [];
  revealObserver?.disconnect();
  closeMenu();
  document.querySelector("#qr-dialog").close();
  const path = decodeURI(location.pathname).replace(/\/$/, "") || "/";
  document.body.dataset.page = path === "/" ? "home" : "inner";
  document.querySelectorAll(".nav a").forEach((a) => {
    const active =
      a.getAttribute("href") === path ||
      (path.startsWith("/urun/") && a.getAttribute("href") === "/koleksiyon");
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const product = path.startsWith("/urun/")
    ? products.find((p) => p.slug === path.split("/")[2])
    : null;
  let title = "Yaşam Alanlarına Yeni Bir Hikâye",
    description = company.hero.description;
  if (path === "/") main.innerHTML = home(company, products);
  else if (path === "/koleksiyon") {
    main.innerHTML = collection(company, products);
    title = "Koleksiyon";
    collectionEvents();
  } else if (product) {
    main.innerHTML = productPage(company, product, products);
    title = product.name;
    description = product.description;
    productEvents(product, id);
  } else if (path === "/hakkimizda") {
    main.innerHTML = about(company);
    title = "Hakkımızda";
  } else if (path === "/iletisim") {
    main.innerHTML = contact(company);
    title = "İletişim";
  } else if (path === "/dunyada-biz") {
    main.innerHTML = world(company, locations);
    title = "Dünyada Biz";
  } else if (path === "/gizlilik") {
    main.innerHTML = privacy();
    title = "Gizlilik Bilgileri";
  } else if (path === "/odani-tasarla") {
    main.innerHTML =
      '<div class="wrap"><div class="page-head"><h1>Odanız hazırlanıyor…</h1><p>3D tasarımcı yükleniyor.</p></div></div>';
    title = "Odanı Tasarla";
  } else {
    main.innerHTML =
      '<div class="wrap route-error"><span class="eyebrow">404 / Sayfa bulunamadı</span><h1>Bu hikâye<br>henüz <em>yazılmadı.</em></h1><p>Aradığınız sayfaya ulaşılamadı.</p><a class="btn" href="/koleksiyon">Koleksiyona Dön</a></div>';
    title = "Sayfa Bulunamadı";
  }
  setMetadata(title, description, path, product?.images[0]);
  observeReveals();
  if (focus) main.focus({ preventScroll: true });
  if (path === "/") {
    document.querySelectorAll("[data-material]").forEach(
      (btn) =>
        (btn.onclick = () => {
          document
            .querySelectorAll("[data-material]")
            .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
          document.querySelector("#material-name").textContent =
            btn.dataset.material;
        }),
    );
    const host = document.querySelector("#home-globe");
    let disposed = false;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((x) => x.isIntersecting)) return;
        observer.disconnect();
        try {
          const { mountGlobe } = await import("./three/globe.js");
          if (disposed) return;
          const dispose = await mountGlobe(host, locations, { preview: true });
          if (disposed) dispose();
          else cleanups.push(dispose);
        } catch {
          if (!disposed)
            host.innerHTML =
              '<div class="webgl-fallback">Dünyayı keşfetmek için “Dünyada Ali Turan” bağlantısını kullanın.</div>';
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(host);
    cleanups.push(() => {
      disposed = true;
      observer.disconnect();
    });
  }
  if (path === "/odani-tasarla")
    try {
      const { mountPlanner } = await import("./pages/planner.js");
      if (id !== routeId) return;
      const dispose = await mountPlanner(main, products);
      if (id !== routeId) dispose();
      else cleanups.push(dispose);
      observeReveals();
    } catch (error) {
      if (id === routeId) {
        main.innerHTML =
          '<div class="wrap route-error"><h1>3D tasarımcı açılamadı.</h1><p>Tarayıcınızın WebGL desteğini kontrol edin. Kataloğu incelemeye devam edebilirsiniz.</p><a class="btn" href="/koleksiyon">Koleksiyon</a></div>';
        toast("3D tasarımcı yüklenemedi.");
      }
      console.error(error);
    }
  if (path === "/dunyada-biz")
    try {
      const { mountGlobe } = await import("./three/globe.js");
      if (id !== routeId) return;
      const dispose = await mountGlobe(
        document.querySelector("#world-canvas"),
        locations,
      );
      if (id !== routeId) dispose();
      else cleanups.push(dispose);
    } catch {
      if (id === routeId)
        document.querySelector("#world-canvas").innerHTML =
          '<div class="webgl-fallback">Bu tarayıcıda 3D küre açılamadı. Konum bilgilerini listedeki bağlantılardan inceleyebilirsiniz.</div>';
    }
}
document.addEventListener("click", (event) => {
  const a = event.target.closest("a");
  if (
    !a ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    a.download ||
    a.target === "_blank"
  )
    return;
  const url = new URL(a.href);
  if (
    url.origin !== location.origin ||
    !["http:", "https:"].includes(url.protocol)
  )
    return;
  if (url.pathname === location.pathname && url.hash) {
    closeMenu();
    return;
  }
  event.preventDefault();
  history.pushState({}, "", url.pathname + url.search + url.hash);
  render(true);
  window.scrollTo({ top: 0, behavior: "instant" });
});
window.addEventListener("popstate", () => render(true));
render();
