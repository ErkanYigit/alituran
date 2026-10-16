import { company, products, locations } from "./data/site.js";
import pages from "./data/seo.json" with { type: "json" };

export const normalizePath = (path) =>
  path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
const kindLabel = (product) =>
  product.type === "corner"
    ? "Köşe Koltuk"
    : product.type === "set"
      ? "3+3+1 Koltuk Takımı"
      : "Berjer";

export function pageSeo(input) {
  const path = normalizePath(input);
  const product = products.find((item) => `/urun/${item.slug}` === path);
  const page = pages[path];
  const title = product
    ? `${product.name} ${product.badge ? `– ${product.badge}` : kindLabel(product)} | Ali Turan Koltuk`
    : page?.title || "Sayfa Bulunamadı | Ali Turan Koltuk";
  const description = product
    ? `${product.name} ${product.type === "chair" ? "modelini" : kindLabel(product).toLocaleLowerCase("tr-TR") + " modelini"} keşfedin. Detay fotoğrafları, ölçüler ve 3D oda yerleşimi. Bursa İnegöl’de Ali Turan Koltuk ile iletişime geçin.`
    : page?.description ||
      "Aradığınız sayfa bulunamadı. Ali Turan Koltuk koleksiyonuna ve İnegöl iletişim bilgilerine ulaşın.";
  return {
    path,
    title,
    description,
    label: product?.name || page?.label || "Sayfa Bulunamadı",
    url: `${company.domain}${path}`,
    image: `${company.domain}${product?.images[0] || company.hero.image}`,
    type: path === "/inegol-mobilya-fuari" ? "article" : "website",
    robots:
      product || page
        ? "index, follow, max-image-preview:large"
        : "noindex, follow",
    product,
  };
}

export const seoRoutes = () => [
  ...Object.keys(pages),
  ...products.map((product) => `/urun/${product.slug}`),
];

export function structuredData(input) {
  const meta = pageSeo(input);
  const businessId = `${company.domain}/#business`,
    websiteId = `${company.domain}/#website`;
  const business = {
    "@type": "FurnitureStore",
    "@id": businessId,
    name: company.name,
    alternateName: ["Ali Turan", "Ali Turan Mobilya"],
    url: `${company.domain}/`,
    description: company.introduction,
    logo: `${company.domain}/assets/branding/ali-turan-logo.png`,
    image: `${company.domain}${company.hero.image}`,
    address: { "@type": "PostalAddress", ...company.postalAddress },
    telephone: company.phone.replace(/[^+\d]/g, ""),
    hasMap: company.mapUrl,
    areaServed: [
      "Türkiye",
      ...locations
        .filter((location) => location.kind === "export" && !location.demo)
        .map((location) => location.country),
    ],
    contactPoint: {
      "@type": "ContactPoint",
      name: company.contactPerson,
      telephone: company.phone.replace(/[^+\d]/g, ""),
      contactType: "Ürün ve sevkiyat bilgisi",
      availableLanguage: "Türkçe",
    },
  };
  const graph = [
    business,
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${company.domain}/`,
      name: company.name,
      alternateName: "Ali Turan Mobilya",
      inLanguage: "tr-TR",
      publisher: { "@id": businessId },
    },
    {
      "@type": "WebPage",
      "@id": `${meta.url}#webpage`,
      url: meta.url,
      name: meta.title,
      description: meta.description,
      inLanguage: "tr-TR",
      isPartOf: { "@id": websiteId },
      about: { "@id": businessId },
    },
  ];
  if (meta.robots.startsWith("noindex"))
    return { "@context": "https://schema.org", "@graph": [] };
  const crumbs = [{ name: "Ana Sayfa", item: `${company.domain}/` }];
  if (meta.product)
    crumbs.push({ name: "Koleksiyon", item: `${company.domain}/koleksiyon` });
  if (meta.path !== "/") crumbs.push({ name: meta.label, item: meta.url });
  if (crumbs.length > 1)
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${meta.url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        ...crumb,
      })),
    });
  if (meta.product) {
    graph[2].mainEntity = { "@id": `${meta.url}#product` };
    graph.push({
      "@type": "Product",
      "@id": `${meta.url}#product`,
      name: meta.product.name,
      category: meta.product.category,
      description: meta.product.description,
      image: meta.product.images.map((path) => company.domain + path),
      url: meta.url,
      brand: { "@type": "Brand", name: company.name },
    });
  }
  if (meta.path === "/koleksiyon")
    graph.push({
      "@type": "ItemList",
      name: "Ali Turan Koltuk Koleksiyonu",
      numberOfItems: products.length,
      itemListElement: products.map((product, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: product.name,
        url: `${company.domain}/urun/${product.slug}`,
      })),
    });
  if (meta.path === "/inegol-mobilya-fuari") {
    graph[2].mainEntity = { "@id": `${meta.url}#article` };
    graph.push({
      "@type": "Article",
      "@id": `${meta.url}#article`,
      headline: "İnegöl Mobilya Fuarı: Koltuk ve Berjer Seçim Rehberi",
      description: meta.description,
      image: [meta.image],
      inLanguage: "tr-TR",
      mainEntityOfPage: { "@id": `${meta.url}#webpage` },
      author: { "@id": businessId },
      publisher: { "@id": businessId },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export const jsonLd = (path) =>
  JSON.stringify(structuredData(path)).replace(/</g, "\\u003c");

export function applySeo(path) {
  const meta = pageSeo(path);
  document.title = meta.title;
  document.querySelector('link[rel="canonical"]').href = meta.url;
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
  for (const [attribute, name, content] of tags) {
    let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attribute, name);
      document.head.append(tag);
    }
    tag.content = content;
  }
  let script = document.querySelector("#page-schema");
  if (!script) {
    script = document.createElement("script");
    script.id = "page-schema";
    script.type = "application/ld+json";
    document.head.append(script);
  }
  script.textContent = jsonLd(path);
}
