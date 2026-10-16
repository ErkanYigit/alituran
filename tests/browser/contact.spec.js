import { test, expect } from "@playwright/test";

test("company contact details, dial links, WhatsApp and address map match owner-provided information", async ({
  page,
}) => {
  await page.goto("/iletisim/");
  await expect(page.locator(".contact-list")).toContainText(
    "Mahmudiye, 7. Mobilya Sk. No:24, 16400 İnegöl/Bursa.",
  );
  await expect(page.locator(".contact-list")).toContainText("Feyzi Yiğit");
  await expect(
    page.locator('.contact-list a[href="tel:+905303468678"]'),
  ).toHaveCount(2);
  await expect(page.locator(".contact-list")).toContainText("0530 346 8678");
  const whatsapp = page.getByRole("link", {
    name: "WhatsApp'tan Yazın — Feyzi Yiğit",
  });
  const whatsappUrl = new URL(await whatsapp.getAttribute("href"));
  expect(whatsappUrl.hostname).toBe("wa.me");
  expect(whatsappUrl.pathname).toBe("/905303468678");
  expect(whatsappUrl.searchParams.get("text")).toContain("Ali Turan Koltuk");
  const mapUrl = new URL(
    await page.getByRole("link", { name: "Haritada Aç" }).getAttribute("href"),
  );
  expect(mapUrl.hostname).toBe("www.google.com");
  expect(mapUrl.searchParams.get("query")).toBe(
    "Mahmudiye, 7. Mobilya Sk. No:24, 16400 İnegöl/Bursa",
  );
  await expect(page.locator(".contact-list")).toContainText(
    "Almanya, Avusturya, Kosova",
  );
  await expect(page.locator(".contact-map")).not.toContainText(
    "henüz paylaşılmadı",
  );
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator("footer")).toContainText("Feyzi Yiğit");
  await expect(page).toHaveTitle(/Ali Turan Koltuk/);
  const organization = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) =>
      nodes
        .flatMap((node) => JSON.parse(node.textContent)["@graph"] || [])
        .find((data) => data["@type"] === "FurnitureStore"),
    );
  expect(organization.address.addressLocality).toBe("İnegöl");
  expect(organization.telephone).toBe("+905303468678");
  expect(organization.areaServed).toEqual([
    "Türkiye",
    "Almanya",
    "Avusturya",
    "Kosova",
  ]);
});

test("embedded map uses the shop address, fits desktop and phones, and retains directions when Google is unavailable", async ({
  page,
}) => {
  // Isolate layout and address integration from the third-party map service.
  await page.route("https://www.google.com/maps?*", (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: '<html lang="tr"><head><meta charset="utf-8"><title>Harita test içeriği</title></head><body><p>Adres haritası</p></body></html>',
    }),
  );
  const html = await (await page.request.get("/iletisim/")).text();
  expect(html).toContain("<iframe");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/iletisim/");
    const map = page.locator(".contact-map iframe");
    await map.scrollIntoViewIfNeeded();
    await expect(map).toBeVisible();
    await expect(map).toHaveAttribute("title", /Ali Turan Koltuk.*İnegöl/);
    const url = new URL(await map.getAttribute("src"));
    expect(url.origin).toBe("https://www.google.com");
    expect(url.searchParams.get("q")).toBe(
      "Mahmudiye, 7. Mobilya Sk. No:24, 16400 İnegöl/Bursa",
    );
    expect(url.searchParams.get("output")).toBe("embed");
    await expect(
      page.frameLocator(".contact-map iframe").getByText("Adres haritası"),
    ).toBeVisible();
    const bounds = await map.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(320);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByRole("link", { name: "Haritada Aç" })).toBeVisible();
  }
  await page.unroute("https://www.google.com/maps?*");
  await page.route("https://www.google.com/maps?*", (route) => route.abort());
  await page.goto("/iletisim/");
  await page.locator(".contact-map").scrollIntoViewIfNeeded();
  await expect(page.locator(".contact-map-info")).toContainText(
    "7. Mobilya Sk. No:24",
  );
  await expect(page.getByRole("link", { name: "Haritada Aç" })).toHaveAttribute(
    "href",
    /^https:\/\/www\.google\.com\/maps\/search/,
  );
});
