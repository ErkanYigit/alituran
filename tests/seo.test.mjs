import { test } from "node:test";
import assert from "node:assert/strict";
import { pageSeo, seoRoutes, structuredData } from "../src/seo.js";
import { siteShell } from "../src/pages/layout.js";
import { fairGuide } from "../src/pages/discovery.js";
import company from "../src/data/company.json" with { type: "json" };
import products from "../src/data/products.json" with { type: "json" };
import navigation from "../src/data/navigation.json" with { type: "json" };

test("public pages have distinct Turkish metadata and canonical URLs independent of queries", () => {
  const routes = seoRoutes();
  assert.equal(new Set(routes).size, routes.length);
  const titles = new Set(),
    descriptions = new Set();
  for (const path of routes) {
    const meta = pageSeo(path + (path === "/" ? "?ref=qr" : "/?ref=qr"));
    assert.equal(meta.url, company.domain + path);
    assert.ok(meta.title.includes("Ali Turan"));
    assert.ok(meta.title.length < 70);
    assert.ok(meta.description.length >= 100 && meta.description.length < 200);
    assert.equal(meta.robots, "index, follow, max-image-preview:large");
    titles.add(meta.title);
    descriptions.add(meta.description);
  }
  assert.equal(titles.size, routes.length);
  assert.equal(descriptions.size, routes.length);
  assert.equal(pageSeo("/missing-page").robots, "noindex, follow");
});

test("business, product and guide schemas use real information and keep page entities separate", () => {
  const graph = structuredData("/iletisim")["@graph"];
  const business = graph.find((item) => item["@type"] === "FurnitureStore");
  assert.equal(
    business.address.streetAddress,
    company.postalAddress.streetAddress,
  );
  assert.equal(business.telephone, "+905303468678");
  assert.ok(business.alternateName.includes("Ali Turan Mobilya"));
  assert.equal(business.geo, undefined); // District coordinates aren't the shop's exact position.
  assert.equal(business.openingHours, undefined);
  for (const product of products) {
    const nodes = structuredData(`/urun/${product.slug}`)["@graph"];
    const entity = nodes.find((item) => item["@type"] === "Product");
    assert.equal(entity.name, product.name);
    assert.equal(entity.image.length, product.images.length);
    assert.equal(entity.offers, undefined);
    assert.equal(entity.aggregateRating, undefined);
    assert.equal(
      nodes.find((item) => item["@type"] === "BreadcrumbList").itemListElement
        .length,
      3,
    );
  }
  const guide = structuredData("/inegol-mobilya-fuari")["@graph"];
  assert.ok(guide.some((item) => item["@type"] === "Article"));
  assert.ok(!guide.some((item) => item["@type"] === "Event"));
  assert.ok(!graph.some((item) => item["@type"] === "Product"));
});

test("shared layout renders crawlable body content and links instead of an empty app shell", () => {
  const article = fairGuide(company, products);
  const html = siteShell(company, products, navigation, article);
  assert.equal(typeof html, "string");
  assert.match(html, /<main id="main"[^>]*><article/);
  assert.match(html, /İnegöl Mobilya Fuarı/);
  assert.match(html, /href="\/inegol-mobilya-fuari"/);
  assert.match(html, /Mahmudiye/);
  for (const product of products)
    assert.ok(html.includes(`/urun/${product.slug}`));
});
