export const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function imageSrcset(source) {
  if (!/^\/assets\/images\/.+\.(webp|png|jpe?g)$/i.test(source)) return "";
  const stem = source.replace(/\.(webp|png|jpe?g)$/i, "");
  return [320, 640, 1024, 1536]
    .map((width) => `${stem}-w${width}.webp ${width}w`)
    .join(", ");
}
export function responsiveAttrs(
  source,
  sizes = "(max-width:600px) 45vw, 33vw",
) {
  const srcset = imageSrcset(source);
  return srcset
    ? `srcset="${escapeHTML(srcset)}" sizes="${escapeHTML(sizes)}"`
    : "";
}
export const icon = (name, size = 20) => {
  const paths = {
    arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
    diagonal: '<path d="M5 19 19 5M5 5h14v14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    box: '<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7 5l10 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2m-3-9 1 1M5 19l-1 1M3 3l2 2m14 14 2 2"/>',
    leaf: '<path d="M20 3C9 2 3 7 4 14s13 10 16-11ZM5 19 16 8"/>',
    rotate: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
    camera:
      '<path d="M3 7h4l2-3h6l2 3h4v14H3z"/><circle cx="12" cy="13" r="4"/>',
    save: '<path d="M4 3h13l3 3v15H4zM8 3v6h8V3M8 21v-8h8v8"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
    mail: '<rect x="3" y="5" width="18" height="14"/><path d="m3 5 9 8 9-8"/>',
    pin: '<path d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    qr: '<path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6zM12 3v9h9M3 12h6v3M12 15v6"/>',
    chevron: '<path d="m8 4 8 8-8 8"/>',
    play: '<path d="m8 4 13 8-13 8z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    reset: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
let timer;
export const locationLabel = (location) =>
  location.city ? `${location.city}, ${location.country}` : location.country;
export const locationCategory = (location) =>
  location.demo
    ? "Örnek konum · şirket faaliyetini göstermez"
    : location.kind === "export"
      ? "Sevkiyat yapılan ülke"
      : location.kind === "base"
        ? "İnegöl’deki adresimiz"
        : "Konum";
export function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("visible"), 4000);
}
export function download(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
export const canonicalProduct = (company, product) =>
  `${company.domain.replace(/\/$/, "")}/urun/${product.slug}`;
export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
