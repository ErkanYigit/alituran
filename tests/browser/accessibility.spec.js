import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("standard content pages and QR dialog have no WCAG A/AA accessibility violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/",
    "/koleksiyon/",
    "/urun/fuari-gozdesi-berjer/",
    "/urun/koltuk-takimi-01/",
    "/hakkimizda/",
    "/iletisim/",
    "/inegol-mobilya-fuari/",
    "/gizlilik/",
  ]) {
    await page.goto(path);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(850);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      path,
    ).toEqual([]);
  }
  await page.goto("/urun/fuari-gozdesi-berjer/");
  await page.getByRole("button", { name: "QR Kodu Göster" }).click();
  await expect(page.locator("#qr-save")).toBeEnabled();
  const modal = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    modal.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
