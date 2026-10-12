// Optional: regenerate the original procedural product imagery.
// Requires running Vite, Chromium and Python with Pillow. No remote imagery.
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import products from "../src/data/products.json" with { type: "json" };
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
for (const product of [...products, { id: "room-preview", room: true }]) {
  const data = await page.evaluate(async (p) => {
    window.assetEngine?.dispose();
    document.body.innerHTML =
      '<div id="asset-studio" style="width:1000px;height:800px"></div>';
    const THREE = await import("/node_modules/three/build/three.module.js");
    const { createEngine } = await import("/src/three/engine.js");
    const { proceduralFurniture, makeRoom } = await import(
      "/src/three/models.js"
    );
    const { dimensions } = await import("/src/three/room-state.js");
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
      const sofa = proceduralFurniture(products[0]);
      sofa.position.set(1.7, 0, 1.8);
      engine.scene.add(sofa);
      const table = proceduralFurniture({
        id: "table",
        type: "table",
        dimensions: { width: 90, depth: 60, height: 36 },
        colors: [{ hex: "#85674e" }],
      });
      table.position.set(2.7, 0, 3.55);
      engine.scene.add(table);
      engine.reset();
    } else {
      const size = dimensions(p),
        model = proceduralFurniture(p);
      model.position.set(size.width / 2, 0, size.depth / 2);
      engine.scene.add(model);
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ color: "#eee7de", roughness: 1 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      ground.position.y = -0.002;
      engine.scene.add(ground);
      engine.reset(size.width, size.depth, 1.4);
      engine.camera.position.set(size.width / 2 + 4, 3.3, size.depth / 2 + 5.4);
      engine.controls.target.set(
        size.width / 2,
        size.height * 0.5,
        size.depth / 2,
      );
      engine.controls.update();
      engine.camera.zoom = p.type === "chair" ? 1.5 : 1.13;
      engine.camera.updateProjectionMatrix();
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
    return engine.capture().split(",")[1];
  }, product);
  const temporary = `/tmp/alituran-${product.id}.png`;
  await writeFile(temporary, Buffer.from(data, "base64"));
  execFileSync("python3", [
    "-c",
    `from PIL import Image; Image.open(${JSON.stringify(temporary)}).save(${JSON.stringify(`public/assets/images/${product.id}.webp`)},'WEBP',quality=90)`,
  ]);
  console.log(`Rendered ${product.id}`);
}
await browser.close();
