import { readFile, writeFile, mkdir } from "node:fs/promises";
import products from "../src/data/products.json" with { type: "json" };
import company from "../src/data/company.json" with { type: "json" };
import navigation from "../src/data/navigation.json" with { type: "json" };
import locations from "../src/data/locations.json" with { type: "json" };
import { imageSrcset, productNotice } from "../src/utils/ui.js";
const template = await readFile("dist/index.html", "utf8");
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${company.domain}/#organization`,
  name: company.name,
  url: company.domain,
  ...(company.postalAddress
    ? { address: { "@type": "PostalAddress", ...company.postalAddress } }
    : {}),
  ...(company.phone
    ? {
        telephone: company.phone.replace(/[^+\d]/g, ""),
        contactPoint: {
          "@type": "ContactPoint",
          name: company.contactPerson,
          telephone: company.phone.replace(/[^+\d]/g, ""),
          contactType: "Ürün ve sevkiyat bilgisi",
        },
      }
    : {}),
  areaServed: locations
    .filter((location) => location.kind === "export" && !location.demo)
    .map((location) => location.country),
};
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const routes = [
  ...navigation.map((n) => ({
    path: n.path,
    title: n.label,
    description: company.hero.description,
  })),
  {
    path: "/gizlilik",
    title: "Gizlilik Bilgileri",
    description:
      "Ali Turan statik katalog ve yerel oda kayıtları hakkında gizlilik bilgileri.",
  },
  ...products.map((p) => ({
    path: `/urun/${p.slug}`,
    title: p.name,
    description: `${p.description} ${productNotice(p)}`.trim(),
    image: p.images[0],
    product: p,
  })),
];
for (const route of routes) {
  const url = `${company.domain}${route.path}`;
  let html = template
    .replace(
      /<title>.*?<\/title>/,
      `<title>${escape(route.title)} — ${escape(company.name)}</title>`,
    )
    .replace(
      /(<meta name="description" content=")[^"]*/,
      `$1${escape(route.description)}`,
    )
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${escape(url)}`)
    .replace(
      /(<meta property="og:title" content=")[^"]*/,
      `$1${escape(route.title + " — " + company.name)}`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*/,
      `$1${escape(route.description)}`,
    )
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${escape(url)}`)
    .replace(
      /(<meta property="og:image" content=")[^"]*/,
      `$1${escape(company.domain + (route.image || company.hero.image))}`,
    );
  const ld = route.product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: route.product.name,
        description: route.description,
        image: route.product.images.map((i) => company.domain + i),
        url,
        brand: { "@type": "Brand", name: company.name },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: route.title,
        description: route.description,
        url,
      };
  const preloadImage =
    route.path === "/" ? company.hero.image : route.product?.images[0];
  if (preloadImage)
    html = html.replace(
      "</head>",
      `<link rel="preload" as="image" href="${escape(preloadImage)}" imagesrcset="${escape(imageSrcset(preloadImage))}" imagesizes="(max-width:600px) calc(100vw - 36px), ${route.product ? "55" : "100"}vw" fetchpriority="high"></head>`,
    );
  html = html
    .replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script><script type="application/ld+json">${JSON.stringify(organization).replace(/</g, "\\u003c")}</script></head>`,
    )
    .replace(
      '<div id="app"></div>',
      `<div id="app"></div><noscript><main style="max-width:800px;margin:auto;padding:40px;font-family:Georgia,serif"><h1>${escape(route.title)}</h1><p>${escape(route.description)}</p><p>Ürün arama, QR kodları ve 3D deneyimleri kullanmak için JavaScript’i etkinleştirin.</p><a href="/">Ana Sayfa</a> · <a href="/koleksiyon/">Koleksiyon</a></main></noscript>`,
    );
  const directory = route.path === "/" ? "dist" : `dist${route.path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
}
await writeFile("dist/404.html", template);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${company.domain}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((r) => `<url><loc>${escape(company.domain + r.path)}</loc></url>`).join("")}</urlset>`,
);
console.log(
  `Generated ${routes.length} static route pages, sitemap.xml and robots.txt`,
);
