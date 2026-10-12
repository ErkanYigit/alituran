import { test, expect } from "@playwright/test";
import * as THREE from "three";
function sofaScreenPoint(box) {
  const camera = new THREE.OrthographicCamera(
    (-3.7 * box.width) / box.height,
    (3.7 * box.width) / box.height,
    3.7,
    -3.7,
    0.1,
    100,
  );
  camera.position.set(8, 6.7, 10.5);
  camera.lookAt(2, 0.864, 2.5);
  camera.updateMatrixWorld();
  const point = new THREE.Vector3(2, 0.48, 2.5).project(camera);
  return {
    x: box.x + ((point.x + 1) * box.width) / 2,
    y: box.y + ((1 - point.y) * box.height) / 2,
  };
}
test("furniture follows pointer drag and remains within the floor", async ({
  page,
}) => {
  await page.goto("/odani-tasarla/");
  await expect(page.locator("#selection-info")).toContainText("Atlas");
  await expect(page.locator("#planner-stage canvas")).toBeVisible();
  await page.waitForTimeout(400);
  const canvas = page.locator("#planner-stage canvas"),
    box = await canvas.boundingBox(),
    point = sofaScreenPoint(box);
  const before = Number(await page.locator("#furniture-x").inputValue());
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 70, point.y + 25, { steps: 12 });
  await page.mouse.up();
  const after = Number(await page.locator("#furniture-x").inputValue());
  expect(Math.abs(after - before)).toBeGreaterThan(0.1);
  expect(after).toBeGreaterThanOrEqual(1.4);
  expect(after).toBeLessThanOrEqual(2.6);
});
test("touch dragging moves furniture on a phone viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/odani-tasarla/");
  await expect(page.locator("#planner-stage canvas")).toBeVisible();
  await page.waitForTimeout(400);
  const canvas = page.locator("#planner-stage canvas"),
    box = await canvas.boundingBox(),
    point = sofaScreenPoint(box);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: point.x, y: point.y }],
  });
  for (let i = 1; i <= 8; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: point.x + i * 5, y: point.y + i * 2 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.locator("#panel-toggle").click();
  await expect(page.locator("#planner-panel")).toBeVisible();
  expect(
    Math.abs(Number(await page.locator("#furniture-x").inputValue()) - 2),
  ).toBeGreaterThan(0.1);
  await context.close();
});
