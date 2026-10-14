import { test, expect } from "@playwright/test";

test("owner's four models and photos replace the demo catalog; fair favorite comes first", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero .eyebrow")).toHaveText("Fuarın Gözdesi");
  await expect(page.locator(".hero-image > img")).toHaveAttribute(
    "src",
    "/assets/images/fair-favorite-armchair.webp",
  );
  await expect(page.locator(".product-card")).toHaveCount(4);
  await expect(page.locator(".product-card").first().locator("h3")).toHaveText(
    "Berjer Modeli 01",
  );
  await expect(
    page.locator(".product-card").first().locator(".product-badge"),
  ).toHaveText("Fuarın Gözdesi");
  await page.goto("/koleksiyon/");
  await expect(page.locator("#catalog-count")).toHaveText("4 model");
  const sources = [
    "fair-favorite-armchair",
    "corner-01",
    "corner-02",
    "living-set-331",
  ];
  for (const [index, id] of sources.entries()) {
    const img = page.locator(".product-card img").nth(index);
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveAttribute("src", `/assets/images/${id}.webp`);
    await expect
      .poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
  await page
    .getByRole("button", { name: "Koltuk Takımları", exact: true })
    .click();
  await expect(page.locator("#catalog-grid article")).toHaveCount(1);
  await expect(page.locator("#catalog-grid h3")).toHaveText("Koltuk Takımı 01");
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).not.toMatch(
    /atlas-kose|luna-kose|vera-kose|nova-moduler|mira-kose|terra-oturma|ada-berjer/,
  );
});

test("3+3+1 shows per-piece estimates and opens, moves and restores three independent room pieces", async ({
  page,
}) => {
  await page.goto("/urun/koltuk-takimi-01/");
  await expect(page.locator(".set-composition")).toHaveText(
    "3+3+1 · 2 üçlü kanepe + 1 berjer",
  );
  await expect(page.locator(".dimension-table caption")).toHaveText(
    "Tahmini ölçüler · parça başına",
  );
  await expect(page.locator(".dimension-table tbody tr")).toHaveCount(2);
  await expect(page.locator(".dimension-table tbody tr").first()).toContainText(
    "2 × Üçlü Kanepe",
  );
  await expect(page.locator(".dimension-table tbody tr").first()).toContainText(
    "230 cm",
  );
  await expect(page.locator(".dimension-table tbody tr").nth(1)).toContainText(
    "1 × Takım Berjeri",
  );
  await expect(page.locator(".dimension-table tbody tr").nth(1)).toContainText(
    "85 cm",
  );
  await page.locator("#product-room-link").click();
  await expect(page.locator("#planner-stage canvas")).toBeVisible();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(3);
  await expect(page.locator("#planner-warning")).toBeEmpty();
  await page.locator("#room-save").click();
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("ali-turan-room-v1")).room,
  );
  expect(before.furniture.map((p) => p.productId)).toEqual([
    "living-set-331-sofa",
    "living-set-331-sofa",
    "living-set-331-chair",
  ]);
  await page.locator("#furniture-x").fill("1.1");
  await page.locator("#furniture-x").dispatchEvent("change");
  await page.locator("#room-save").click();
  const moved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("ali-turan-room-v1")).room,
  );
  expect(moved.furniture[0].x).toBe(1.1);
  expect(moved.furniture.slice(1)).toEqual(before.furniture.slice(1));
  await page.reload();
  await expect(page.locator("#planner-stage canvas")).toBeVisible();
  await page.locator("#room-load").click();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(3);
  await expect(page.locator("#furniture-x")).toHaveValue("1.1");
});
