import * as THREE from "three";
import { feature } from "topojson-client";
import { createEngine } from "./engine.js";
import { escapeHTML as e } from "../utils/ui.js";

function vector(lat, lon, r = 1.58) {
  const phi = ((90 - lat) * Math.PI) / 180,
    theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}
function texture(topology) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e6dfd1";
  ctx.fillRect(0, 0, 2048, 1024);
  const land = feature(topology, topology.objects.land);
  const shapes =
    land.type === "FeatureCollection"
      ? land.features.map((item) => item.geometry)
      : [land.geometry];
  const polygons = shapes.flatMap((geometry) =>
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates],
  );
  ctx.fillStyle = "#baa287";
  ctx.strokeStyle = "#a68b6b";
  ctx.lineWidth = 0.65;
  for (const polygon of polygons)
    for (const offset of [-2048, 0, 2048]) {
      ctx.beginPath();
      for (const ring of polygon) {
        let previous = null;
        ring.forEach(([lon, lat], i) => {
          let x = ((lon + 180) / 360) * 2048;
          if (previous !== null) {
            while (x - previous > 1024) x -= 2048;
            while (x - previous < -1024) x += 2048;
          }
          previous = x;
          const y = ((90 - lat) / 180) * 1024;
          if (i === 0) ctx.moveTo(x + offset, y);
          else ctx.lineTo(x + offset, y);
        });
        ctx.closePath();
      }
      ctx.fill("evenodd");
      ctx.stroke();
    }
  ctx.strokeStyle = "#c0b5a155";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 2048; x += 2048 / 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 1024 / 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export async function mountGlobe(host, locations, { preview = false } = {}) {
  let engine;
  try {
    engine = createEngine(host, {
      orthographic: false,
      shadows: false,
      background: preview ? "#f6f2ec" : "#eee7de",
    });
  } catch {
    host.querySelector(".loading-3d")?.remove();
    const fallback = document.createElement("p");
    fallback.className = "webgl-fallback";
    fallback.textContent =
      "Bu tarayıcı 3D küreyi desteklemiyor. Konumları listedeki düğmelerden inceleyebilirsiniz.";
    host.append(fallback);
    document
      .querySelectorAll("[data-location]")
      .forEach((btn) => (btn.onclick = () => select(btn.dataset.location)));
    return () => {};
  }
  const { scene, camera, controls, canvas } = engine;
  let disposed = false;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;
  controls.minDistance = 3.6;
  controls.maxDistance = 8;
  const reset = () => {
    camera.position.set(3, 1.6, 5.7);
    controls.target.set(0, 0, 0);
    controls.update();
  };
  reset();
  const group = new THREE.Group();
  scene.add(group);
  const material = new THREE.MeshStandardMaterial({
    color: "#d9caba",
    roughness: 0.94,
  });
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 64, 40),
    material,
  );
  group.add(globe);
  const markers = [];
  for (const location of locations) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 8),
      new THREE.MeshStandardMaterial({
        color: "#704832",
        emissive: "#704832",
        emissiveIntensity: 0.15,
      }),
    );
    marker.position.copy(vector(location.latitude, location.longitude));
    marker.userData.locationId = location.id;
    group.add(marker);
    markers.push(marker);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.067, 0.003, 6, 32),
      new THREE.MeshBasicMaterial({ color: "#92745d" }),
    );
    ring.position.copy(vector(location.latitude, location.longitude, 1.575));
    ring.lookAt(0, 0, 0);
    group.add(ring);
  }
  let interacting = false;
  const onStart = () => (interacting = true),
    onEnd = () => (interacting = false);
  controls.addEventListener("start", onStart);
  controls.addEventListener("end", onEnd);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  engine.setTick((delta) => {
    if (!interacting && !reduced.matches) group.rotation.y += delta * 0.06;
  });
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Etkileşimli dünya küresi. Ok tuşları ile döndürün, artı ve eksi ile yakınlaştırın.",
  );
  function select(id) {
    const location = locations.find((l) => l.id === id);
    if (!location) return;
    const panel = document.querySelector("#location-info");
    if (panel)
      panel.innerHTML = `<h3>${e(location.city)}, ${e(location.country)}</h3><p>${e(location.description)}</p>${location.demo ? '<span class="demo-badge">Yalnızca örnek konum</span>' : ""}`;
    if (engine && !disposed) {
      const position = vector(location.latitude, location.longitude)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), group.rotation.y)
        .normalize();
      camera.position.copy(position.multiplyScalar(5.9));
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }
  document
    .querySelectorAll("[data-location]")
    .forEach((btn) => (btn.onclick = () => select(btn.dataset.location)));
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  let downPosition = null;
  const down = (event) =>
    (downPosition = { x: event.clientX, y: event.clientY });
  const click = (event) => {
    if (
      !downPosition ||
      Math.hypot(
        event.clientX - downPosition.x,
        event.clientY - downPosition.y,
      ) > 6
    )
      return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([globe, ...markers]);
    const hit = hits.find((h) => h.object.userData.locationId);
    if (hit && (!hits[0] || hit.distance <= hits[0].distance + 0.03))
      select(hit.object.userData.locationId);
  };
  const key = (event) => {
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "-"].includes(
        event.key,
      )
    )
      event.preventDefault();
    if (event.key === "ArrowLeft") group.rotation.y -= 0.15;
    if (event.key === "ArrowRight") group.rotation.y += 0.15;
    if (event.key === "ArrowUp")
      group.rotation.x = THREE.MathUtils.clamp(
        group.rotation.x - 0.1,
        -0.5,
        0.5,
      );
    if (event.key === "ArrowDown")
      group.rotation.x = THREE.MathUtils.clamp(
        group.rotation.x + 0.1,
        -0.5,
        0.5,
      );
    if (event.key === "+") engine.zoom(1.15);
    if (event.key === "-") engine.zoom(1 / 1.15);
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointerup", click);
  canvas.addEventListener("keydown", key);
  const inButton = document.querySelector("#globe-in"),
    outButton = document.querySelector("#globe-out"),
    resetButton = document.querySelector("#globe-reset");
  if (inButton) inButton.onclick = () => engine.zoom(1.15);
  if (outButton) outButton.onclick = () => engine.zoom(1 / 1.15);
  if (resetButton)
    resetButton.onclick = () => {
      group.rotation.set(0, 0, 0);
      reset();
    };
  const controller = new AbortController();
  host.setAttribute("aria-busy", "true");
  fetch("/assets/data/land-110m.json", { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error("Harita yüklenemedi");
      return response.json();
    })
    .then((data) => {
      if (!disposed) {
        material.map = texture(data);
        material.color.set("#ffffff");
        material.needsUpdate = true;
        host.setAttribute("aria-busy", "false");
        host.dataset.mapState = "ready";
      }
    })
    .catch((error) => {
      if (!disposed && error.name !== "AbortError") {
        host.setAttribute("aria-busy", "false");
        host.dataset.mapState = "error";
        const info = document.createElement("p");
        info.className = "canvas-label";
        info.textContent = "Coğrafi doku yüklenemedi.";
        host.append(info);
      }
    });
  return () => {
    disposed = true;
    controller.abort();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointerup", click);
    canvas.removeEventListener("keydown", key);
    controls.removeEventListener("start", onStart);
    controls.removeEventListener("end", onEnd);
    engine.dispose();
  };
}
