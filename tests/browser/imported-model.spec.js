import { test, expect } from "@playwright/test";

test("supplied Nass GLB loads on desktop and mobile without an assembly fallback", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const asset = page.waitForResponse((response) =>
      response.url().endsWith("/assets/models/nass-berjer.glb"),
    );
    await page.goto("/urun/fuari-gozdesi-berjer/");
    await page.locator("#exploded-host").scrollIntoViewIfNeeded();
    expect((await asset).status()).toBe(200);
    const canvas = page.locator("#exploded-canvas canvas");
    await expect(canvas).toBeVisible();
    await expect(page.locator(".exploded-controls")).toBeHidden();
    await expect(page.locator(".exploded-section")).toContainText(
      "Modeli sürükleyerek çevirin",
    );
    // Texture decode is asynchronous after the HTTP response.
    await page.waitForTimeout(1200);
    const before = await canvas.evaluate((el) => el.toDataURL());
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5, {
      steps: 12,
    });
    await page.mouse.up();
    await page.waitForTimeout(200);
    expect(await canvas.evaluate((el) => el.toDataURL())).not.toBe(before);
    await expect(page.locator("body")).not.toContainText(
      "yaklaşık model gösteriliyor",
    );
    await expect(page.locator("body")).not.toContainText(
      "örnek animasyon gösteriliyor",
    );

    const roomAsset = page.waitForResponse((response) =>
      response.url().endsWith("/assets/models/nass-berjer.glb"),
    );
    await page.locator("#product-room-link").click();
    expect((await roomAsset).status()).toBe(200);
    await expect(page.locator("#planner-stage canvas")).toBeVisible();
    await expect(page.locator("#selection-info")).toContainText("Nass Berjer");
    await expect(page.locator("[data-select-furniture]")).toHaveCount(1);
    await expect(page.locator("#planner-warning")).toBeEmpty();
  }
  expect(errors).toEqual([]);
});
