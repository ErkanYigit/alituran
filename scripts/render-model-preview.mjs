// Render the actual interactive geometry beside the owner's supplied photos.
// Start npm run dev first. This only writes a review image under docs/.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import products from "../src/data/products.json" with { type: "json" };

const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
const browser = await chromium.launch({
  executablePath,
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(process.env.PREVIEW_URL || "http://127.0.0.1:5173");
  const renders = [];
  for (const product of products) {
    const render = await page.evaluate(async (p) => {
      document.body.innerHTML =
        '<div id="model-studio" style="width:800px;height:520px"></div>';
      const THREE = await import("/node_modules/three/build/three.module.js");
      const { createEngine } = await import("/src/three/engine.js");
      const { loadFurniture } = await import("/src/three/models.js");
      const model = await loadFurniture(p, p.colors[0].hex),
        engine = createEngine(document.querySelector("#model-studio"));
      engine.scene.add(model);
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: "#eee7de", roughness: 1 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.003;
      ground.receiveShadow = true;
      engine.scene.add(ground);
      const w = p.dimensions.width / 100,
        d = p.dimensions.depth / 100,
        h = p.dimensions.height / 100;
      engine.reset(w, d, h);
      engine.controls.minAzimuthAngle = -Math.PI;
      engine.controls.maxAzimuthAngle = Math.PI;
      engine.controls.target.set(0, h * 0.48, 0);
      engine.camera.position.set(
        p.type === "corner" || p.type === "set" ? -4 : 4,
        2.7,
        5.5,
      );
      engine.camera.zoom =
        p.type === "chair" ? 1.05 : p.type === "corner" ? 1.7 : 1.55;
      engine.camera.updateProjectionMatrix();
      engine.controls.update();
      await new Promise((resolve) => setTimeout(resolve, 300));
      const png = engine.capture();
      engine.dispose();
      return png;
    }, product);
    renders.push({ ...product, render });
  }
  await page.evaluate((items) => {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style>
      body{background:#f9f3e9;color:#362e27;padding:38px;font-family:Manrope,Arial,sans-serif;margin:0}
      header{padding-bottom:22px;border-bottom:1px solid #d9ccbd}h1{font-size:30px;letter-spacing:-1px;margin:0 0 10px}p{font-size:13px;color:#6b6258}
      .review-row{margin:30px 0}h2{font-size:20px;margin:0 0 14px}.compare{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      figure{margin:0;background:#eee7de;border-radius:16px;overflow:hidden}img{width:100%;height:340px;object-fit:contain;display:block}figcaption{padding:14px 18px;font-size:12px;background:#e4dad0}
      </style>`,
    );
    document.body.innerHTML =
      "<header><h1>Ali Turan · Fotoğraf & 3D karşılaştırması</h1><p>Fotoğraflardan uyarlanan yaklaşık geometri. Eksik ölçüler tahminidir; desenler dijital temsillerdir.</p></header>";
    items.forEach((p) => {
      const section = document.createElement("section");
      section.className = "review-row";
      const title = document.createElement("h2");
      title.textContent = p.name + (p.badge ? " · " + p.badge : "");
      section.append(title);
      const compare = document.createElement("div");
      compare.className = "compare";
      for (const [src, label] of [
        [p.images[0], "Gönderdiğiniz ürün görseli"],
        [p.render, "Güncellenen etkileşimli 3D model"],
      ]) {
        const figure = document.createElement("figure"),
          img = document.createElement("img"),
          caption = document.createElement("figcaption");
        img.src = src;
        caption.textContent = label;
        figure.append(img, caption);
        compare.append(figure);
      }
      section.append(compare);
      document.body.append(section);
    });
  }, renders);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.querySelectorAll("img")].map((img) => img.decode()),
    );
  });
  await mkdir("docs", { recursive: true });
  await page.screenshot({ path: "docs/3d-models.png", fullPage: true });
  console.log("Rendered docs/3d-models.png from the live 3D geometry.");
} finally {
  await browser.close();
}
