import * as THREE from "three";
import { createEngine, disposeGroup } from "./engine.js";
import { loadFurniture, proceduralFurniture, replaceColor } from "./models.js";
import { dimensions } from "./room-state.js";
import { toast } from "../utils/ui.js";

export async function mountExploded(host, product) {
  let engine;
  try {
    engine = createEngine(host, { background: "#eee7de" });
  } catch {
    host.innerHTML =
      '<p class="webgl-fallback">Bu tarayıcı 3D gösterimi desteklemiyor. Diğer ürün bilgilerini inceleyebilirsiniz.</p>';
    document
      .querySelectorAll(".exploded-controls button,.exploded-controls input")
      .forEach((el) => (el.disabled = true));
    return () => {};
  }
  let model = await loadFurniture(product, product.colors[0].hex);
  if (!host.isConnected) {
    disposeGroup(model);
    engine.dispose();
    return () => {};
  }
  if (!model.userData.procedural) {
    const count = [];
    model.traverse((object) => {
      if (object.isMesh && /base|seat|back|arm|leg|cushion/i.test(object.name))
        count.push(object);
    });
    if (count.length < 2) {
      disposeGroup(model);
      model = proceduralFurniture(product, product.colors[0].hex);
      toast("Ayrı parçalı model bulunamadı; örnek animasyon gösteriliyor.");
    }
  }
  engine.scene.add(model);
  const d = dimensions(product);
  model.position.set(d.width / 2, 0, d.depth / 2);
  engine.reset(d.width, d.depth, 1.7);
  engine.camera.zoom = 0.8;
  if (product.type === "corner") {
    engine.controls.minAzimuthAngle = -Math.PI;
    engine.controls.maxAzimuthAngle = Math.PI;
    engine.camera.position.set(d.width / 2 - 5, 3.2, d.depth / 2 + 6);
    engine.controls.target.set(d.width / 2, d.height * 0.55, d.depth / 2);
    engine.controls.update();
    engine.camera.zoom = 1.35;
  } else if (product.type === "set") {
    engine.controls.minAzimuthAngle = -Math.PI;
    engine.controls.maxAzimuthAngle = Math.PI;
    engine.camera.position.set(d.width / 2, 3.4, d.depth / 2 + 7);
    engine.controls.target.set(d.width / 2, d.height * 0.55, d.depth / 2);
    engine.controls.update();
    engine.camera.zoom = 1.05;
  }
  engine.camera.updateProjectionMatrix();
  engine.controls.enableRotate = false;
  engine.controls.enableZoom = false;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshStandardMaterial({ color: "#eee7de", roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.005;
  floor.receiveShadow = true;
  engine.scene.add(floor);
  const parts = [];
  model.traverse((object) => {
    if (!object.isMesh) return;
    const home = object.position.clone();
    let direction;
    if (/Sırt|back/i.test(object.name))
      direction = new THREE.Vector3(0, 0.45, -0.4);
    else if (/Oturum|Minder|seat|cushion/i.test(object.name))
      direction = new THREE.Vector3(0, 0.65, 0.15);
    else if (/Sol|left/i.test(object.name))
      direction = new THREE.Vector3(-0.45, 0.1, 0);
    else if (/Sağ|right|arm/i.test(object.name))
      direction = new THREE.Vector3(0.45, 0.1, 0);
    else if (/Ayak|leg/i.test(object.name))
      direction = new THREE.Vector3(Math.sign(home.x) * 0.08, 0.02, 0.3);
    else direction = new THREE.Vector3(0, 0.05, 0);
    parts.push({ object, home, direction });
  });
  let progress = 0,
    playing = false,
    direction = 1;
  const slider = document.querySelector("#explode-progress");
  const apply = () => {
    const eased = progress * progress * (3 - 2 * progress);
    parts.forEach((p) =>
      p.object.position.copy(p.home).addScaledVector(p.direction, eased),
    );
    slider.value = progress;
  };
  document.querySelector("#explode-play").onclick = () => {
    if (progress >= 1) progress = 0;
    direction = 1;
    playing = true;
  };
  document.querySelector("#explode-pause").onclick = () => (playing = false);
  document.querySelector("#explode-reverse").onclick = () => {
    direction = -1;
    playing = true;
  };
  document.querySelector("#explode-restart").onclick = () => {
    progress = 0;
    direction = 1;
    playing = true;
    apply();
  };
  slider.oninput = () => {
    progress = Number(slider.value);
    playing = false;
    apply();
  };
  engine.setTick((delta) => {
    if (!playing) return;
    progress = THREE.MathUtils.clamp(progress + (direction * delta) / 3, 0, 1);
    apply();
    if (progress === 0 || progress === 1) playing = false;
  });
  const onColor = (event) => replaceColor(model, event.detail);
  document.addEventListener("product-color", onColor);
  return () => {
    playing = false;
    document.removeEventListener("product-color", onColor);
    engine.dispose();
  };
}
