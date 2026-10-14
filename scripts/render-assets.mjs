// Optional: regenerate only the illustrative room preview. Product photographs are never overwritten.
// Requires running Vite and Chromium. No remote imagery.
import { chromium } from "@playwright/test";
import sharp from "sharp";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1000, height: 800 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:5173");
for (const product of [{ id: "room-preview", room: true }]) {
  const data = await page.evaluate(async (p) => {
    window.assetEngine?.dispose();
    document.body.innerHTML =
      '<div id="asset-studio" style="width:1000px;height:800px"></div>';
    const { createEngine } = await import("/src/three/engine.js");
    const { proceduralFurniture, makeRoom } =
      await import("/src/three/models.js");
    const host = document.querySelector("#asset-studio"),
      engine = createEngine(host, { background: "#eee7de" });
    window.assetEngine = engine;
    if (p.room) {
      const room = {
        width: 4,
        depth: 5,
        height: 2.7,
        windows: [
          {
            id: "preview",
            wall: "back",
            position: 2.1,
            width: 1.5,
            height: 1.3,
            sill: 0.8,
          },
        ],
        columns: [],
      };
      engine.scene.add(makeRoom(room));
      const products = (await import("/src/data/products.json?import")).default;
      const sofa = proceduralFurniture(
        products.find((p) => p.id === "corner-02"),
      );
      sofa.position.set(2, 0, 1.6);
      engine.scene.add(sofa);
      const table = proceduralFurniture({
        id: "table",
        type: "table",
        dimensions: { width: 90, depth: 60, height: 36 },
        colors: [{ hex: "#85674e" }],
      });
      table.position.set(2, 0, 3.55);
      engine.scene.add(table);
      engine.reset();
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
    return engine.capture().split(",")[1];
  }, product);
  await sharp(Buffer.from(data, "base64"))
    .webp({ quality: 90 })
    .toFile("public/assets/images/room-preview.webp");
  console.log(`Rendered ${product.id}`);
}
await browser.close();
