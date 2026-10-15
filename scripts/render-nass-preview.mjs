// Review the actual Nass Berjer meshes from the angles in the new references.
// Requires npm run dev; writes docs/nass-berjer-views.png, never product photos.
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import products from "../src/data/products.json" with { type: "json" };

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1400 },
    deviceScaleFactor: 1,
  });
  await page.goto(process.env.PREVIEW_URL || "http://127.0.0.1:5173");
  const frames = [];
  for (const [label, camera] of [
    ["Önden", [0.001, 1.15, 5]],
    ["Yandan · C profili", [5, 1.15, 0]],
    ["Arkadan · bütünleşik sırt", [0.001, 1.15, -5]],
    ["Ön çapraz", [3, 1.8, 5]],
  ]) {
    const frame = await page.evaluate(
      async ({ product, camera }) => {
        document.body.innerHTML =
          '<div id="nass-studio" style="width:650px;height:550px"></div>';
        const THREE = await import("/node_modules/three/build/three.module.js");
        const { createEngine } = await import("/src/three/engine.js");
        const { loadFurniture } = await import("/src/three/models.js");
        const engine = createEngine(document.querySelector("#nass-studio"));
        const model = await loadFurniture(product, product.colors[0].hex);
        engine.scene.add(model);
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 30),
          new THREE.MeshStandardMaterial({ color: "#eee7de", roughness: 1 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.003;
        floor.receiveShadow = true;
        engine.scene.add(floor);
        engine.reset(
          product.dimensions.width / 100,
          product.dimensions.depth / 100,
          product.dimensions.height / 100,
        );
        engine.controls.minAzimuthAngle = -Math.PI;
        engine.controls.maxAzimuthAngle = Math.PI;
        engine.controls.target.set(0, product.dimensions.height / 220, 0);
        engine.camera.position.set(...camera);
        engine.camera.zoom = 1;
        engine.camera.updateProjectionMatrix();
        engine.controls.update();
        await new Promise((r) => setTimeout(r, 300));
        const frame = engine.capture();
        engine.dispose();
        return frame;
      },
      {
        product: products.find((p) => p.id === "fair-favorite-armchair"),
        camera,
      },
    );
    frames.push({ label, frame });
  }
  await page.evaluate(async (frames) => {
    document.head.insertAdjacentHTML(
      "beforeend",
      "<style>body{margin:0;padding:32px;background:#faf4eb;color:#362e27;font-family:Manrope,Arial,sans-serif}h1{font-size:30px;margin:0 0 10px}header p{font-size:14px;margin:0 0 24px}main{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;border-radius:16px;overflow:hidden;background:#eee7de}img{width:100%;display:block}figcaption{padding:14px 20px;font-size:16px;background:#e4dad0}</style>",
    );
    document.body.innerHTML =
      "<header><h1>Nass Berjer · dört açıdan 3D görünüm</h1><p>Sağladığınız FBX dosyasından aktarılan dokulu 3D model. Ölçüler tahminidir.</p></header><main></main>";
    for (const { label, frame } of frames) {
      const figure = document.createElement("figure"),
        img = document.createElement("img"),
        caption = document.createElement("figcaption");
      img.src = frame;
      caption.textContent = label;
      figure.append(img, caption);
      document.querySelector("main").append(figure);
    }
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode()));
  }, frames);
  await mkdir("docs", { recursive: true });
  await page.screenshot({ path: "docs/nass-berjer-views.png", fullPage: true });
  console.log("Rendered docs/nass-berjer-views.png from live 3D geometry.");
} finally {
  await browser.close();
}
