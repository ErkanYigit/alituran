import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { readFile } from "node:fs/promises";

function observeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}
async function planner(page) {
  await page.goto("/odani-tasarla/");
  await expect(page.locator("#planner-stage canvas")).toBeVisible();
  await expect(page.locator("#selection-info")).toContainText(
    "Nass Berjer",
  );
  await page.waitForTimeout(300);
}
async function saveState(page) {
  await page.locator("#room-save").click();
  return page.evaluate(
    () => JSON.parse(localStorage.getItem("ali-turan-room-v1")).room,
  );
}
test("navigation, all generated direct routes, page metadata, assets and desktop layout", async ({
  page,
}) => {
  const errors = observeErrors(page);
  for (const path of [
    "/",
    "/koleksiyon/",
    "/hakkimizda/",
    "/dunyada-biz/",
    "/iletisim/",
    "/gizlilik/",
    "/urun/kose-modeli-01/",
    "/urun/kose-modeli-02/",
    "/urun/koltuk-takimi-01/",
    "/urun/fuari-gozdesi-berjer/",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://alituranmob.com${path === "/" ? "/" : path.replace(/\/$/, "")}`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const link of await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
      const response = await page.request.get(link);
      expect(response.status(), link).toBe(200);
    }
  }
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Ana menü" })
    .getByRole("link", { name: "Koleksiyon", exact: true })
    .click();
  await expect(page).toHaveURL(/koleksiyon/);
  await page.reload();
  await expect(page.locator("#catalog-grid article")).toHaveCount(4);
  expect(errors).toEqual([]);
});
test("catalog search, category selection and empty results", async ({
  page,
}) => {
  await page.goto("/koleksiyon/");
  await page
    .getByRole("button", { name: "Köşe Koltuklar", exact: true })
    .click();
  await expect(page.locator("#catalog-grid article")).toHaveCount(2);
  await page.getByRole("searchbox", { name: "Ürün ara" }).fill("Nass");
  await expect(page.locator("#catalog-grid article")).toHaveCount(1);
  await page.getByRole("searchbox").fill("bulunmayan ürün");
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByRole("button", { name: "Berjerler", exact: true }).click();
  await expect(page.locator("#catalog-grid")).toContainText("Nass Berjer");
  await page.getByRole("button", { name: "Tümü", exact: true }).click();
  await expect(page.locator("#catalog-grid article")).toHaveCount(4);
});
test("product gallery, colors, canonical QR decoding and actual PNG download", async ({
  page,
}) => {
  const errors = observeErrors(page);
  await page.goto("/urun/kose-modeli-01/");
  await page.locator("[data-image]").first().click();
  await expect(page.locator("#gallery-image")).toHaveAttribute(
    "src",
    "/assets/images/corner-01.webp",
  );
  await page.getByRole("button", { name: "Krem rengi", exact: true }).click();
  await expect(page.locator("#color-name")).toHaveText("Krem");
  await expect(page.locator("#product-room-link")).toHaveAttribute(
    "href",
    /color=%23e8dfd0/,
  );
  await expect(page.locator(".dimension-table caption")).toHaveText("Ölçüler");
  await page.getByRole("button", { name: "QR Kodu Göster" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#qr-save")).toBeEnabled();
  await page.waitForFunction(
    () => !!document.querySelector("#qr-save")?.onclick,
  );
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#qr-save").click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("ali-turan-corner-01-qr.png");
  const png = PNG.sync.read(await readFile(await download.path()));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe("https://alituranmob.com/urun/kose-modeli-01");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});
test("room dimensions, real windows and columns, furniture, colors, warnings, persistence and exports", async ({
  page,
}) => {
  const errors = observeErrors(page);
  await planner(page);
  await page.locator("#room-width").fill("6");
  await page.locator("#room-width").dispatchEvent("change");
  await expect(page.locator("#axis-width")).toHaveText("Genişlik · X: 6.0 m");
  await page.getByText("02 — Duvarlar ve Pencereler", { exact: true }).click();
  await page.locator("#window-add").click();
  await expect(page.locator("[data-remove-window]")).toHaveCount(1);
  await page.locator("[data-edit-window]").click();
  await page.locator("#window-wall").selectOption("side");
  await page.locator("#window-position").fill("3");
  await page.locator("#window-width").fill("1.5");
  await page.locator("#window-add").click();
  await page.getByText("03 — Kolonlar", { exact: true }).click();
  await page.locator("#column-add").click();
  await expect(page.locator("[data-remove-column]")).toHaveCount(1);
  await page.locator("[data-edit-column]").click();
  await page.locator("#column-width").fill(".6");
  await page.locator("#column-rotation").fill("30");
  await page.locator("#column-add").click();
  await page.locator("#furniture-model").selectOption("coffee-table");
  await page.locator("#furniture-add").click();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(2);
  await page.getByRole("button", { name: "Mobilyayı sağa döndür" }).click();
  await expect(page.locator("#furniture-angle")).toHaveValue("15");
  await page.locator("#furniture-x").fill("99");
  await page.locator("#furniture-x").dispatchEvent("change");
  expect(Number(await page.locator("#furniture-x").inputValue())).toBeLessThan(
    6,
  );
  await page.locator("#furniture-model").selectOption("side-table");
  await page.locator("#furniture-replace").click();
  await expect(page.locator("#selection-info")).toContainText("Yan Sehpa");
  await page.locator("[data-select-furniture]").first().click();
  await page
    .getByRole("button", { name: "Kiremit rengi", exact: true })
    .click();
  let saved = await saveState(page);
  expect(saved.width).toBe(6);
  expect(saved.windows[0]).toMatchObject({
    wall: "side",
    position: 3,
    width: 1.5,
  });
  expect(saved.columns[0].width).toBe(0.6);
  expect(saved.furniture[0].color).toBe("#b44f20");
  const screenshotEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Görünümü PNG olarak kaydet" })
    .click();
  const screenshot = await screenshotEvent;
  const image = PNG.sync.read(await readFile(await screenshot.path()));
  expect(image.width).toBeGreaterThan(400);
  expect(new Set(image.data).size).toBeGreaterThan(100);
  await page.locator("#room-reset").click();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(0);
  await page.locator("#room-load").click();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(2);
  await expect(page.locator("[data-remove-window]")).toHaveCount(1);
  await expect(page.locator("[data-remove-column]")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("#planner-stage canvas")).toBeVisible();
  await page.locator("#room-load").click();
  saved = await saveState(page);
  expect(saved.furniture).toHaveLength(2);
  await page.getByText("02 — Duvarlar ve Pencereler", { exact: true }).click();
  await page.getByText("03 — Kolonlar", { exact: true }).click();
  await page.locator("[data-remove-window]").click();
  await page.locator("[data-remove-column]").click();
  await page.locator("#furniture-delete").click();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(1);
  await page.locator("#room-forget").click();
  expect(
    await page.evaluate(() => localStorage.getItem("ali-turan-room-v1")),
  ).toBe(null);
  expect(errors).toEqual([]);
});
test("planner keyboard movement, placement bounds and overlap warnings", async ({
  page,
}) => {
  await planner(page);
  await page.locator("#planner-stage canvas").focus();
  const before = Number(await page.locator("#furniture-x").inputValue());
  await page.keyboard.press("ArrowRight");
  expect(Number(await page.locator("#furniture-x").inputValue())).toBeCloseTo(
    before + 0.05,
  );
  await page.keyboard.press("r");
  await expect(page.locator("#furniture-angle")).toHaveValue("15");
  await page.locator("#furniture-model").selectOption("fair-favorite-armchair");
  await page.locator("#furniture-add").click();
  await expect(page.locator("#planner-warning")).toContainText("üst üste");
  await page.locator("#planner-stage canvas").focus();
  await page.keyboard.press("Delete");
  await expect(page.locator("[data-select-furniture]")).toHaveCount(1);
});
test("globe interaction and confirmed export countries", async ({ page }) => {
  const errors = observeErrors(page);
  await page.goto("/dunyada-biz/");
  await expect(page.locator("#world-canvas canvas")).toBeVisible();
  await expect(page.locator("#world-canvas")).toHaveAttribute(
    "data-map-state",
    "ready",
  );
  await expect(page.locator("[data-location]")).toHaveCount(4);
  await page.locator('[data-location="almanya"]').click();
  await expect(page.locator("#location-info")).toContainText(
    "Almanya, koltuk ve mobilya sevkiyatı yaptığımız ülkeler arasındadır.",
  );
  await expect(page.locator("#location-info")).toContainText(
    "Sevkiyat yapılan ülke",
  );
  await page.locator('[data-location="avusturya"]').click();
  await expect(page.locator("#location-info h3")).toHaveText("Avusturya");
  await page.locator('[data-location="kosova"]').click();
  await expect(page.locator("#location-info h3")).toHaveText("Kosova");
  await page.locator('[data-location="inegol"]').click();
  await expect(page.locator("#location-info")).toContainText(
    "Mahmudiye, 7. Mobilya Sk. No:24",
  );
  await page.locator("#globe-in").click();
  await page.locator("#globe-out").click();
  await page.locator("#globe-reset").click();
  const canvas = page.locator("#world-canvas canvas"),
    box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, {
    steps: 10,
  });
  await page.mouse.up();
  await canvas.focus();
  await page.keyboard.press("ArrowLeft");
  expect(errors).toEqual([]);
});
test("exploded furniture progress, play, pause, reverse and restart", async ({
  page,
}) => {
  const errors = observeErrors(page);
  await page.goto("/urun/kose-modeli-01/");
  await page.locator("#exploded-host").scrollIntoViewIfNeeded();
  await expect(page.locator("#exploded-canvas canvas")).toBeVisible();
  await page.locator("#explode-progress").evaluate((el) => {
    el.value = ".6";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator("#explode-play").click();
  await page.waitForTimeout(400);
  await page.locator("#explode-pause").click();
  const paused = Number(await page.locator("#explode-progress").inputValue());
  expect(paused).toBeGreaterThan(0.6);
  await page.waitForTimeout(200);
  expect(
    Number(await page.locator("#explode-progress").inputValue()),
  ).toBeCloseTo(paused, 2);
  await page.locator("#explode-reverse").click();
  await page.waitForTimeout(300);
  await page.locator("#explode-pause").click();
  expect(
    Number(await page.locator("#explode-progress").inputValue()),
  ).toBeLessThan(paused);
  await page.locator("#explode-restart").click();
  await page.waitForTimeout(200);
  expect(
    Number(await page.locator("#explode-progress").inputValue()),
  ).toBeLessThan(0.2);
  expect(errors).toEqual([]);
});
test("mobile navigation, focus, responsive layouts and planner bottom controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#menu-toggle").click();
  await expect(page.locator("#menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-toggle")).toBeFocused();
  await page.locator("#menu-toggle").click();
  await page
    .getByRole("navigation", { name: "Ana menü" })
    .getByRole("link", { name: "Koleksiyon", exact: true })
    .click();
  await expect(page.locator("#menu-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  for (const path of [
    "/",
    "/koleksiyon/",
    "/urun/kose-modeli-01/",
    "/hakkimizda/",
    "/iletisim/",
    "/dunyada-biz/",
    "/odani-tasarla/",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      path,
    ).toBe(true);
  }
  await expect(page.locator("#panel-toggle")).toBeVisible();
  await page.locator("#panel-toggle").click();
  await expect(page.locator("#planner-panel")).toBeVisible();
  await page.locator("#furniture-model").selectOption("fair-favorite-armchair");
  await page.locator("#furniture-add").click();
  await expect(page.locator("[data-select-furniture]")).toHaveCount(2);
});
test("graceful WebGL failure leaves product content and catalog usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto("/odani-tasarla/");
  await expect(page.locator("#planner-stage")).toContainText(
    "WebGL bu tarayıcıda kullanılamıyor",
  );
  await page.goto("/urun/kose-modeli-01/");
  await page.locator("#exploded-host").scrollIntoViewIfNeeded();
  await expect(page.locator("#exploded-canvas")).toContainText(
    "Bu tarayıcı 3D gösterimi desteklemiyor",
  );
  await page.goto("/koleksiyon/");
  await expect(page.locator("#catalog-grid article")).toHaveCount(4);
});
