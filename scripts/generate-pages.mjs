import { readFile, writeFile, mkdir } from "node:fs/promises";
import { products, company, navigation, locations } from "../src/data/site.js";
import {
  home,
  collection,
  productPage,
  about,
  contact,
  world,
  privacy,
} from "../src/pages/content.js";
import { fairGuide, plannerIntro, notFound } from "../src/pages/discovery.js";
import { siteShell } from "../src/pages/layout.js";
import { escapeHTML as e, imageSrcset } from "../src/utils/ui.js";
import { pageSeo, seoRoutes, jsonLd } from "../src/seo.js";

const template = await readFile("dist/index.html", "utf8");
const contentFor = (path) => {
  const product = pageSeo(path).product;
  if (product) return productPage(company, product, products);
  const pages = {
    "/": () => home(company, products),
    "/koleksiyon": () => collection(company, products),
    "/hakkimizda": () => about(company),
    "/iletisim": () => contact(company),
    "/dunyada-biz": () => world(company, locations),
    "/gizlilik": privacy,
    "/odani-tasarla": plannerIntro,
    "/inegol-mobilya-fuari": () => fairGuide(company, products),
  };
  return (pages[path] || notFound)();
};

function htmlFor(path) {
  const meta = pageSeo(path);
  const shell = siteShell(company, products, navigation, contentFor(path));
  if (typeof shell !== "string") throw new Error(`Could not prerender ${path}`);
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${e(meta.title)}</title>`)
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${e(meta.url)}">`,
    );
  const tags = [
    ["name", "description", meta.description],
    ["name", "robots", meta.robots],
    ["property", "og:title", meta.title],
    ["property", "og:description", meta.description],
    ["property", "og:url", meta.url],
    ["property", "og:image", meta.image],
    ["property", "og:type", meta.type],
    ["property", "og:site_name", company.name],
    ["property", "og:locale", "tr_TR"],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", meta.title],
    ["name", "twitter:description", meta.description],
    ["name", "twitter:image", meta.image],
  ];
  for (const [attribute, name, value] of tags) {
    const pattern = new RegExp(
      `<meta\\s+${attribute}="${name}"\\s+content="[^"]*"\\s*/?>`,
    );
    const tag = `<meta ${attribute}="${name}" content="${e(value)}">`;
    html = pattern.test(html)
      ? html.replace(pattern, tag)
      : html.replace("</head>", `${tag}</head>`);
  }
  const image =
    meta.path === "/" ? company.hero.image : meta.product?.images[0];
  if (image)
    html = html.replace(
      "</head>",
      `<link rel="preload" as="image" href="${e(image)}" imagesrcset="${e(imageSrcset(image))}" imagesizes="(max-width:600px) calc(100vw - 36px), ${meta.product ? "55" : "100"}vw" fetchpriority="high"></head>`,
    );
  return html
    .replace(
      "</head>",
      `<script id="page-schema" type="application/ld+json">${jsonLd(path)}</script></head>`,
    )
    .replace(
      '<div id="app"></div>',
      `<div id="app">${shell}</div><noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>`,
    );
}

const routes = seoRoutes();
for (const path of routes) {
  const directory = path === "/" ? "dist" : `dist${path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, htmlFor(path));
}
await writeFile("dist/404.html", htmlFor("/404"));
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${company.domain}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${routes
    .map((path) => {
      const meta = pageSeo(path);
      const images =
        meta.product?.images || (path === "/" ? [company.hero.image] : []);
      return `<url><loc>${e(meta.url)}</loc>${images.map((image) => `<image:image><image:loc>${e(company.domain + image)}</image:loc></image:image>`).join("")}</url>`;
    })
    .join("")}</urlset>`,
);
console.log(
  `Generated ${routes.length} prerendered route pages, sitemap.xml and robots.txt`,
);
