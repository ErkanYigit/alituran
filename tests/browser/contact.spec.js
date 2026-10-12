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
        .map((node) => JSON.parse(node.textContent))
        .find((data) => data["@type"] === "Organization"),
    );
  expect(organization.address.addressLocality).toBe("İnegöl");
  expect(organization.telephone).toBe("+905303468678");
  expect(organization.areaServed).toEqual(["Almanya", "Avusturya", "Kosova"]);
});
