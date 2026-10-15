import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("product detail photos share a frame, promote the selected photo and support accessible zoom and pan", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [slug, count] of [
      ["fuari-gozdesi-berjer", 4],
      ["kose-modeli-01", 4],
      ["kose-modeli-02", 4],
      ["koltuk-takimi-01", 1],
    ]) {
      await page.goto(`/urun/${slug}/`);
      const thumbs = page.locator("[data-image]");
      await expect(thumbs).toHaveCount(count);
      const initial = await page.locator("#gallery-open").boundingBox();
      for (let i = 0; i < count; i++) {
        const thumbnail = thumbs.nth(i);
        const source = await thumbnail.getAttribute("data-image");
        await thumbnail.click();
        await expect(page.locator("#gallery-image")).toHaveAttribute(
          "src",
          source,
        );
        await expect(thumbnail).toHaveAttribute("aria-pressed", "true");
        await expect(
          page.locator('[data-image][aria-pressed="true"]'),
        ).toHaveCount(1);
        await page
          .locator("#gallery-image")
          .evaluate((image) => image.decode());
        const frame = await page.locator("#gallery-open").boundingBox();
        expect(frame.width).toBeCloseTo(initial.width, 1);
        expect(frame.height).toBeCloseTo(initial.height, 1);
        expect(
          await page
            .locator("#gallery-image")
            .evaluate((image) => getComputedStyle(image).objectFit),
        ).toBe("contain");
      }
      await page.locator("#gallery-open").click();
      const dialog = page.locator("#image-dialog");
      await expect(dialog).toBeVisible();
      await expect(page.locator("#image-full")).toBeVisible();
      await expect(page.locator("#image-zoom")).toHaveText("100%");
      await expect(page.locator("#image-full")).toHaveAttribute(
        "src",
        await thumbs.last().getAttribute("data-image"),
      );
      const size = await page.locator("#image-full").boundingBox();
      await page.locator("#image-plus").click();
      await expect(page.locator("#image-zoom")).toHaveText("150%");
      expect(
        (await page.locator("#image-full").boundingBox()).width,
      ).toBeGreaterThan(size.width * 1.3);
      for (let i = 0; i < 5; i++) await page.locator("#image-plus").click();
      await expect(page.locator("#image-zoom")).toHaveText("400%");
      await expect(page.locator("#image-plus")).toBeDisabled();
      const viewport = page.locator(".image-viewport");
      const before = await viewport.evaluate((el) => ({
        x: el.scrollLeft,
        y: el.scrollTop,
      }));
      const box = await viewport.boundingBox();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4, {
        steps: 8,
      });
      await page.mouse.up();
      const after = await viewport.evaluate((el) => ({
        x: el.scrollLeft,
        y: el.scrollTop,
      }));
      expect(
        Math.abs(after.x - before.x) + Math.abs(after.y - before.y),
      ).toBeGreaterThan(20);
      await page.locator("#image-reset").click();
      await expect(page.locator("#image-zoom")).toHaveText("100%");
      await expect(page.locator("#image-minus")).toBeDisabled();
      if (count > 1) {
        await page.keyboard.press("ArrowRight");
        await expect(page.locator("#image-counter")).toHaveText("1 / 4");
        await expect(page.locator("#image-full")).toBeVisible();
        await page.locator("#image-next").click();
        await expect(page.locator("#image-counter")).toHaveText("2 / 4");
        await page.locator("#image-prev").click();
        await expect(page.locator("#image-counter")).toHaveText("1 / 4");
      } else await expect(page.locator("#image-next")).toBeDisabled();
      const bounds = await dialog.evaluate((el) => ({
        width: el.scrollWidth - el.clientWidth,
        top: el.getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom,
      }));
      expect(bounds.width).toBeLessThanOrEqual(1);
      expect(bounds.top).toBeGreaterThanOrEqual(0);
      expect(bounds.bottom).toBeLessThanOrEqual(1000);
      if (slug === "kose-modeli-01") {
        const accessibility = await new AxeBuilder({ page })
          .include("#image-dialog")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(page.locator("#gallery-open")).toBeFocused();
      expect(
        await page
          .locator("body")
          .evaluate((el) => el.classList.contains("photo-viewer-open")),
      ).toBe(false);
      await page.locator("#gallery-open").click();
      await page.locator("#image-close").click();
      await expect(dialog).not.toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.locator("#menu-toggle").click();
  await page
    .getByRole("navigation", { name: "Ana menü" })
    .getByRole("link", { name: "Koleksiyon", exact: true })
    .click();
  await expect(page.locator("#image-dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("photo viewer supports real phone pinch gestures and mouse wheel zoom", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/urun/fuari-gozdesi-berjer/");
    await page.locator("[data-image]").nth(1).tap();
    await page.locator("#gallery-open").tap();
    await expect(page.locator("#image-full")).toBeVisible();
    const viewport = page.locator(".image-viewport");
    const bounds = await viewport.boundingBox();
    const x = bounds.x + bounds.width / 2,
      y = bounds.y + bounds.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: x - 30, y },
        { x: x + 30, y },
      ],
    });
    for (let distance = 35; distance <= 65; distance += 5)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: x - distance, y },
          { x: x + distance, y },
        ],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    expect(
      parseInt(await page.locator("#image-zoom").textContent()),
    ).toBeGreaterThan(150);
    await page.locator("#image-reset").tap();
    await expect(page.locator("#image-zoom")).toHaveText("100%");
    await page.mouse.move(x, y);
    await page.mouse.wheel(0, -250);
    await expect
      .poll(async () =>
        parseInt(await page.locator("#image-zoom").textContent()),
      )
      .toBeGreaterThan(100);
    await page.locator("#image-close").tap();
    await expect(page.locator("#image-dialog")).not.toBeVisible();
  } finally {
    await context.close();
  }
});
