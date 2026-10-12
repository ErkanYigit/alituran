import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function disposeGroup(group) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  group.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const m of [].concat(object.material || [])) {
      materials.add(m);
      for (const value of Object.values(m))
        if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach((g) => g.dispose());
  textures.forEach((t) => t.dispose());
  materials.forEach((m) => m.dispose());
  group.removeFromParent();
}
export function createEngine(
  host,
  { background = "#eee7de", shadows = true, orthographic = true } = {},
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setSize(host.clientWidth || 600, host.clientHeight || 450);
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const camera = orthographic
    ? new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 100)
    : new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const canvas = renderer.domElement;
  host.querySelector(".loading-3d")?.remove();
  host.append(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.35;
  controls.minAzimuthAngle = 0.08;
  controls.maxAzimuthAngle = 1.48;
  controls.minZoom = 0.5;
  controls.maxZoom = 2.5;
  controls.minDistance = 3;
  controls.maxDistance = 12;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8a289, 2));
  const sun = new THREE.DirectionalLight(0xfff5e4, 3);
  sun.position.set(2, 8, 5);
  sun.castShadow = shadows;
  sun.shadow.mapSize.set(
    innerWidth < 600 ? 1024 : 2048,
    innerWidth < 600 ? 1024 : 2048,
  );
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  scene.add(sun.target);
  let span = 7,
    frame,
    disposed = false,
    visible = true,
    tick = () => {},
    last = performance.now();
  const resize = () => {
    if (disposed) return;
    const width = host.clientWidth || 600,
      height = host.clientHeight || 450,
      aspect = width / height;
    renderer.setSize(width, height);
    if (orthographic) {
      camera.left = (-span * aspect) / 2;
      camera.right = (span * aspect) / 2;
      camera.top = span / 2;
      camera.bottom = -span / 2;
    } else camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };
  const reset = (width = 4, depth = 5, height = 2.7) => {
    span = Math.max(width, depth) * 1.48;
    camera.zoom = 1;
    camera.position.set(width / 2 + 6, 6.7, depth / 2 + 8);
    controls.target.set(width / 2, height * 0.32, depth / 2);
    sun.target.position.copy(controls.target);
    controls.update();
    resize();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const visibility = new IntersectionObserver(
    (entries) => (visible = entries[0].isIntersecting),
  );
  visibility.observe(host);
  const loop = (now) => {
    if (disposed) return;
    frame = requestAnimationFrame(loop);
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden || !visible) return;
    controls.update();
    tick(delta, now);
    renderer.render(scene, camera);
  };
  reset();
  frame = requestAnimationFrame(loop);
  const onLost = (event) => {
    event.preventDefault();
    host.dispatchEvent(new CustomEvent("webgl-lost"));
  };
  canvas.addEventListener("webglcontextlost", onLost);
  return {
    scene,
    camera,
    renderer,
    controls,
    canvas,
    reset,
    resize,
    setTick: (fn) => (tick = fn),
    zoom: (factor) => {
      if (orthographic) {
        camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, 0.5, 2.5);
        camera.updateProjectionMatrix();
      } else {
        const vector = camera.position.clone().sub(controls.target);
        const length = THREE.MathUtils.clamp(vector.length() / factor, 3, 12);
        camera.position.copy(controls.target).add(vector.setLength(length));
      }
    },
    capture: () => {
      renderer.render(scene, camera);
      return canvas.toDataURL("image/png");
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      controls.dispose();
      disposeGroup(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
