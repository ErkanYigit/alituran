import { test, expect } from "@playwright/test";
import { pageSeo, seoRoutes } from "../../src/seo.js";

test("every crawlable route has complete HTML, consistent metadata, linked schemas and sitemap coverage", async ({
  page,
  browser,
}) => {
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  const robots = await (await page.request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://alituranmob.com/sitemap.xml");
  const plain = await browser.newContext({ javaScriptEnabled: false });
  try {
    const bot = await plain.newPage();
    for (const path of seoRoutes()) {
      const meta = pageSeo(path);
      const response = await page.request.get(path === "/" ? "/" : path + "/");
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain('<main id="main"');
      expect(html).not.toContain('<div id="app"></div>');
      expect(html).not.toContain('<div id="app">undefined');
      expect(sitemap).toContain(`<loc>${meta.url}</loc>`);
      await bot.goto(`http://127.0.0.1:4173${path}`);
      await expect(bot.locator("main h1")).toBeVisible();
      await expect(bot).toHaveTitle(meta.title);
      await expect(bot.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        meta.description,
      );
      await expect(bot.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        meta.robots,
      );
      await expect(bot.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        meta.url,
      );
      await expect(bot.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        meta.title,
      );
      await expect(
        bot.locator('meta[name="twitter:description"]'),
      ).toHaveAttribute("content", meta.description);
      await expect(bot.locator("#page-schema")).toHaveCount(1);
      expect(
        await bot
          .locator("#page-schema")
          .evaluate((el) =>
            JSON.parse(el.textContent)["@graph"].some(
              (item) => item["@type"] === "FurnitureStore",
            ),
          ),
      ).toBe(true);
      if (meta.product) {
        await expect(bot.locator(".description").first()).toHaveText(
          meta.product.description,
        );
        for (const image of meta.product.images)
          expect(sitemap).toContain(
            `<image:loc>https://alituranmob.com${image}</image:loc>`,
          );
      }
      if (path === "/")
        await expect(bot.locator(".local-discovery h2")).toBeVisible();
    }
    await bot.goto("http://127.0.0.1:4173/404.html");
    await expect(bot.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
    await expect(bot.locator("main h1")).toContainText("henüz");
  } finally {
    await plain.close();
  }
});

test("SPA navigation updates SEO without stale product markup; fair guide works on small screens", async ({
  page,
}) => {
  await page.goto("/urun/kose-modeli-01/");
  await page.locator('.footer-links a[href="/inegol-mobilya-fuari"]').click();
  for (const path of ["/inegol-mobilya-fuari", "/koleksiyon", "/"]) {
    if (path === "/") await page.locator('.site-header > a[href="/"]').click();
    else if (path === "/koleksiyon")
      await page.locator('.footer-links a[href="/koleksiyon"]').first().click();
    const meta = pageSeo(path);
    await expect(page).toHaveTitle(meta.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      meta.description,
    );
    await expect(page.locator("#page-schema")).toHaveCount(1);
    const schema = await page
      .locator("#page-schema")
      .evaluate((el) => JSON.parse(el.textContent));
    expect(
      schema["@graph"].some((entity) => entity["@type"] === "Product"),
    ).toBe(false);
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/inegol-mobilya-fuari/");
    await expect(page.locator(".guide-models li")).toHaveCount(4);
    await page.locator(".guide-questions summary").first().click();
    await expect(
      page.locator(".guide-questions details").first(),
    ).toContainText("0530 346 8678");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/404.html");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await page.locator('main a[href="/koleksiyon"]').click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow, max-image-preview:large",
  );
});
