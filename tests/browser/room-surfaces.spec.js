import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";
import { readFile } from "node:fs/promises";

test("wall colors and floor finishes visibly change, persist and restore on desktop and mobile", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  test.setTimeout(90000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/odani-tasarla/?model=coffee-table");
    const canvas = page.locator("#planner-stage canvas");
    await expect(page.locator("#selection-info")).toContainText("Alçak Sehpa");
    if (width === 390) await page.locator("#panel-toggle").click();
    await expect(page.locator("#room-floor-finish")).toHaveValue("oak");
    const frame = async () => {
      await canvas.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      return PNG.sync.read(
        Buffer.from(
          (await canvas.evaluate((el) => el.toDataURL())).split(",")[1],
          "base64",
        ),
      );
    };
    const changedPixels = (a, b) => {
      let changed = 0;
      for (let i = 0; i < a.data.length; i += 4)
        if (
          Math.abs(a.data[i] - b.data[i]) +
            Math.abs(a.data[i + 1] - b.data[i + 1]) +
            Math.abs(a.data[i + 2] - b.data[i + 2]) >
          12
        )
          changed++;
      return changed;
    };
    const setColor = async (id, color) => {
      await page.locator(id).evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }, color);
    };
    let before = await frame();
    for (const [id, color] of [
      ["#room-back-color", "#446655"],
      ["#room-side-color", "#bc9980"],
      ["#room-floor-color", "#7b634a"],
    ]) {
      await setColor(id, color);
      const after = await frame();
      expect(changedPixels(before, after), id).toBeGreaterThan(500);
      before = after;
    }
    for (const finish of ["walnut", "concrete", "oak", "tile"]) {
      await page.locator("#room-floor-finish").selectOption(finish);
      const after = await frame();
      expect(changedPixels(before, after), finish).toBeGreaterThan(500);
      before = after;
    }
    await setColor("#room-floor-color", "#a9b3b8");
    await page.locator("#room-save").click();
    const saved = await page.evaluate(
      () => JSON.parse(localStorage.getItem("ali-turan-room-v1")).room,
    );
    expect(saved.appearance).toEqual({
      wallColors: { back: "#446655", side: "#bc9980" },
      floor: { finish: "tile", color: "#a9b3b8" },
    });
    await page.locator("#room-width").fill("6");
    await page.locator("#room-width").dispatchEvent("change");
    await expect(page.locator("#room-floor-finish")).toHaveValue("tile");
    await expect(page.locator("#room-back-color")).toHaveValue("#446655");
    await page.locator("#room-reset").click();
    await expect(page.locator("#room-floor-finish")).toHaveValue("oak");
    await expect(page.locator("#room-back-color")).toHaveValue("#ede6dc");
    await expect(page.locator("#room-side-color")).toHaveValue("#ede6dc");
    await expect(page.locator("#room-floor-color")).toHaveValue("#c8b293");
    await page.reload();
    await expect(canvas).toBeVisible();
    await page.locator("#room-load").click();
    if (width === 390) await page.locator("#panel-toggle").click();
    await expect(page.locator("#room-floor-finish")).toHaveValue("tile");
    await expect(page.locator("#room-back-color")).toHaveValue("#446655");
    await expect(page.locator("#room-side-color")).toHaveValue("#bc9980");
    await expect(page.locator("#room-floor-color")).toHaveValue("#a9b3b8");
    await page.locator("#room-save").click();
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("ali-turan-room-v1")).room,
      ),
    ).toEqual(saved);
    const downloadEvent = page.waitForEvent("download");
    await page.locator("#room-screenshot").click();
    const download = await downloadEvent;
    const image = PNG.sync.read(await readFile(await download.path()));
    expect(image.width).toBeGreaterThan(300);
    expect(new Set(image.data).size).toBeGreaterThan(100);
    const accessibility = await new AxeBuilder({ page })
      .include("#room-appearance")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
