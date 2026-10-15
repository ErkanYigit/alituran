import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("default corner column and windows can be removed with walls, saved, restored and reset on desktop and mobile", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const savedRoom = async () => {
    await page.locator("#room-save").click();
    return page.evaluate(
      () => JSON.parse(localStorage.getItem("ali-turan-room-v1")).room,
    );
  };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/odani-tasarla/?model=coffee-table");
    await expect(page.locator("#selection-info")).toContainText("Alçak Sehpa");
    if (width === 390) await page.locator("#panel-toggle").click();
    await page
      .getByText("03 — Duvarlar ve Pencereler", { exact: true })
      .click();
    await page.getByText("04 — Kolonlar", { exact: true }).click();
    await expect(page.locator("[data-remove-window]")).toHaveCount(2);
    await expect(page.locator("[data-remove-column]")).toHaveCount(1);
    const start = await savedRoom();
    expect(start.columns[0]).toMatchObject({
      width: 0.4,
      depth: 0.4,
      x: 0.2,
      z: 0.2,
      rotation: 0,
    });
    expect(start.windows.map((win) => win.wall)).toEqual(["back", "side"]);
    await page.locator("#room-width").fill("6");
    await page.locator("#room-width").dispatchEvent("change");
    expect((await savedRoom()).columns).toEqual(start.columns);
    await page.locator("#room-back-wall").uncheck();
    await expect(
      page.locator('[data-edit-window="default-window-back"]'),
    ).toBeDisabled();
    await expect(page.locator("#window-wall")).toHaveValue("side");
    await page.locator("#room-side-wall").uncheck();
    await expect(page.locator("#window-add")).toBeDisabled();
    await expect(page.locator("#window-wall")).toBeDisabled();
    await page.locator('[data-remove-window="default-window-back"]').click();
    await page.locator("#room-back-wall").check();
    await expect(page.locator("#window-add")).toBeEnabled();
    await expect(page.locator("[data-remove-window]")).toHaveCount(1);
    await page.locator("[data-remove-window]").click();
    await page.locator("[data-remove-column]").click();
    // A subsequent column also starts flush with the junction by default.
    await page.locator("#column-add").click();
    expect((await savedRoom()).columns[0]).toMatchObject({
      x: 0.2,
      z: 0.2,
      rotation: 0,
    });
    await page.locator("[data-remove-column]").click();
    await page.locator("#room-back-wall").uncheck();
    const removed = await savedRoom();
    expect(removed).toMatchObject({
      walls: { back: false, side: false },
      windows: [],
      columns: [],
    });
    await page.locator("#room-reset").click();
    await expect(page.locator("[data-remove-window]")).toHaveCount(2);
    await expect(page.locator("[data-remove-column]")).toHaveCount(1);
    await expect(page.locator("#room-back-wall")).toBeChecked();
    await expect(page.locator("#room-side-wall")).toBeChecked();
    await page.locator("#room-load").click();
    await expect(page.locator("[data-remove-window]")).toHaveCount(0);
    await expect(page.locator("[data-remove-column]")).toHaveCount(0);
    await expect(page.locator("#room-back-wall")).not.toBeChecked();
    await expect(page.locator("#room-side-wall")).not.toBeChecked();
    await page.reload();
    await expect(page.locator("#planner-stage canvas")).toBeVisible();
    await page.locator("#room-load").click();
    expect(await savedRoom()).toEqual(removed);
    if (width === 390) await page.locator("#panel-toggle").click();
    await page
      .getByText("03 — Duvarlar ve Pencereler", { exact: true })
      .click();
    const result = await new AxeBuilder({ page })
      .include("#planner-panel details:has(#room-back-wall)")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
