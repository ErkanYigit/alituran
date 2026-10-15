import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { dimensions } from "./room-state.js";
import { disposeGroup } from "./engine.js";
import { photoFurniture } from "./photo-furniture.js";
import { defaultAppearance } from "./room-finishes.js";
import { floorMaterial } from "./room-surfaces.js";

export function proceduralFurniture(product, color = product.colors[0].hex) {
  if (product.type === "set") {
    const group = new THREE.Group();
    group.userData.photoProfile = product.id;
    for (const placement of product.previewLayout) {
      const component = product.components.find(
        (p) => p.id === placement.componentId,
      );
      const model = proceduralFurniture(
        { ...component, colors: product.colors },
        color,
      );
      model.name = component.name;
      model.position.set(placement.x, 0, placement.z);
      model.rotation.y = placement.rotation;
      group.add(model);
    }
    return normalizeFurniture(group, product, color);
  }
  const photo = photoFurniture(product, color);
  if (photo) return normalizeFurniture(photo, product, color);
  const group = new THREE.Group();
  const d = dimensions(product),
    w = d.width,
    depth = d.depth,
    h = d.height;
  const fabric = new THREE.MeshStandardMaterial({ color, roughness: 0.96 });
  const wood = new THREE.MeshStandardMaterial({
    color: "#88674b",
    roughness: 0.8,
  });
  const add = (name, size, pos, material = fabric, radius = 0.045) => {
    const geometry = new RoundedBoxGeometry(
      ...size,
      3,
      Math.min(radius, ...size.map((x) => x / 3)),
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.colorable = material === fabric;
    mesh.userData.materialRole = material === wood ? "wood" : "fabric";
    group.add(mesh);
    return mesh;
  };
  if (product.type === "rug") {
    add("Halı", [w, 0.02, depth], [0, 0.01, 0], fabric, 0.006);
    for (let i = 0; i < 10; i++)
      add(
        "Dokuma" + i,
        [w, 0.002, 0.003],
        [0, 0.022, -depth / 2 + (depth * i) / 10],
        new THREE.MeshStandardMaterial({ color: "#baa88d", roughness: 1 }),
        0.001,
      );
  } else if (product.type === "table") {
    add("Tabla", [w, 0.07, depth], [0, h - 0.035, 0], wood, 0.06);
    for (const x of [-1, 1])
      for (const z of [-1, 1])
        add(
          "Ayak",
          [0.055, h - 0.07, 0.055],
          [x * (w / 2 - 0.1), (h - 0.07) / 2, z * (depth / 2 - 0.1)],
          wood,
          0.015,
        );
  } else {
    const corner = product.type === "corner",
      mainD = corner ? Math.min(0.96, depth * 0.62) : depth,
      backZ = -depth / 2,
      mainZ = backZ + mainD / 2,
      seatY = h * 0.47;
    add(
      "Gövde",
      [w - 0.08, h * 0.23, mainD - 0.04],
      [0, h * 0.26, mainZ],
      fabric,
      0.06,
    );
    const n = Math.max(1, Math.round(w / 0.9));
    const arm = 0.17,
      seatW = (w - arm * 2 - 0.06) / n;
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + arm + 0.03 + seatW / 2 + i * seatW;
      add(
        "Oturum " + (i + 1),
        [seatW - 0.028, h * 0.2, mainD - 0.23],
        [x, seatY, mainZ + 0.07],
        fabric,
        0.065,
      );
      add(
        "Sırt " + (i + 1),
        [seatW - 0.025, h * 0.43, 0.19],
        [x, h * 0.74, backZ + 0.1],
        fabric,
        0.08,
      );
    }
    add(
      "Sol Kol",
      [arm, h * 0.67, mainD],
      [-w / 2 + arm / 2, h * 0.505, mainZ],
      fabric,
      0.055,
    );
    add(
      "Sağ Kol",
      [arm, h * 0.67, corner ? depth : mainD],
      [w / 2 - arm / 2, h * 0.505, corner ? 0 : mainZ],
      fabric,
      0.055,
    );
    if (corner) {
      const chaiseW = Math.min(0.96, w * 0.4),
        extension = depth - mainD;
      add(
        "Uzanma Gövdesi",
        [chaiseW - 0.08, h * 0.23, extension],
        [w / 2 - arm - chaiseW / 2, h * 0.26, backZ + mainD + extension / 2],
        fabric,
        0.06,
      );
      add(
        "Uzanma Minderi",
        [chaiseW - 0.09, h * 0.2, extension + 0.02],
        [
          w / 2 - arm - chaiseW / 2,
          seatY,
          backZ + mainD + extension / 2 - 0.02,
        ],
        fabric,
        0.06,
      );
    }
    for (const x of [-w / 2 + 0.19, w / 2 - 0.19])
      for (const z of [backZ + 0.17, backZ + mainD - 0.17])
        add("Ayak", [0.07, h * 0.17, 0.07], [x, h * 0.085, z], wood, 0.012);
    if (corner)
      for (const x of [w / 2 - 0.23, w / 2 - 0.8])
        add(
          "Uzanma Ayağı",
          [0.07, h * 0.17, 0.07],
          [x, h * 0.085, depth / 2 - 0.17],
          wood,
          0.012,
        );
  }
  return normalizeFurniture(group, product, color);
}
function normalizeFurniture(group, product, color) {
  const bounds = new THREE.Box3().setFromObject(group),
    size = bounds.getSize(new THREE.Vector3());
  const { width, height, depth } = dimensions(product);
  group.scale.set(width / size.x, height / size.y, depth / size.z);
  const scaled = new THREE.Box3().setFromObject(group),
    center = scaled.getCenter(new THREE.Vector3());
  const wrapper = new THREE.Group();
  group.position.set(-center.x, -scaled.min.y, -center.z);
  wrapper.add(group);
  wrapper.userData = {
    procedural: true,
    productId: product.id,
    color,
    photoProfile: group.userData.photoProfile || null,
  };
  return wrapper;
}
export async function loadFurniture(product, color) {
  if (!product.model3d) return proceduralFurniture(product, color);
  try {
    const result = await new GLTFLoader().loadAsync(product.model3d);
    const model = result.scene;
    const bounds = new THREE.Box3().setFromObject(model),
      size = bounds.getSize(new THREE.Vector3()),
      d = dimensions(product);
    if (Math.min(size.x, size.y, size.z) <= 0)
      throw new Error("Geçersiz model boyutları");
    model.scale.set(d.width / size.x, d.height / size.y, d.depth / size.z);
    const scaled = new THREE.Box3().setFromObject(model);
    const center = scaled.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -scaled.min.y, -center.z);
    const wrapper = new THREE.Group();
    wrapper.add(model);
    wrapper.userData = { procedural: false, productId: product.id };
    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        if (/fabric|upholstery|kumas|kumaş/i.test(object.name))
          for (const material of [].concat(object.material))
            material.color?.set(color);
      }
    });
    return wrapper;
  } catch {
    const fallback = proceduralFurniture(product, color);
    fallback.userData.loadFailed = true;
    return fallback;
  }
}
export function replaceColor(group, color) {
  group.traverse((object) => {
    if (!object.isMesh) return;
    const colorable = group.userData.procedural
      ? object.userData.colorable === true
      : /fabric|upholstery|kumas|kumaş/i.test(object.name);
    if (!colorable) return;
    for (const material of [].concat(object.material)) {
      material.color?.set(color);
      if (material.userData.tintOffset)
        material.color?.offsetHSL(0, 0, material.userData.tintOffset);
      if (group.userData.procedural && material.sheenColor)
        material.sheenColor.copy(material.color);
    }
  });
}

export function makeRoom(room) {
  const group = new THREE.Group();
  const appearance = room.appearance ?? defaultAppearance();
  const wallMaterials = Object.fromEntries(
    ["back", "side"].map((wall) => [
      wall,
      new THREE.MeshStandardMaterial({
        color: appearance.wallColors[wall],
        roughness: 1,
      }),
    ]),
  );
  const mesh = (size, pos, material, surface) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    m.position.set(...pos);
    m.receiveShadow = true;
    m.castShadow = true;
    if (surface) m.userData.roomSurface = surface;
    group.add(m);
    return m;
  };
  mesh(
    [room.width, 0.08, room.depth],
    [room.width / 2, -0.04, room.depth / 2],
    floorMaterial(room),
    "floor",
  );
  for (const wall of ["back", "side"]) {
    // A removed wall also hides its frames/glass; its windows remain editable
    // after the wall is restored, unless the user deletes them separately.
    if (room.walls?.[wall] === false) continue;
    const windows = room.windows.filter((w) => w.wall === wall),
      length = wall === "back" ? room.width : room.depth;
    const xs = [
        0,
        length,
        ...windows.flatMap((w) => [
          w.position - w.width / 2,
          w.position + w.width / 2,
        ]),
      ].sort((a, b) => a - b),
      ys = [
        0,
        room.height,
        ...windows.flatMap((w) => [w.sill, w.sill + w.height]),
      ].sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i++)
      for (let j = 0; j < ys.length - 1; j++) {
        const dx = xs[i + 1] - xs[i],
          dy = ys[j + 1] - ys[j];
        if (dx < 0.001 || dy < 0.001) continue;
        const x = (xs[i] + xs[i + 1]) / 2,
          y = (ys[j] + ys[j + 1]) / 2;
        if (
          windows.some(
            (w) =>
              Math.abs(x - w.position) < w.width / 2 &&
              y > w.sill &&
              y < w.sill + w.height,
          )
        )
          continue;
        if (wall === "back")
          mesh([dx, dy, 0.1], [x, y, -0.05], wallMaterials.back, wall);
        else mesh([0.1, dy, dx], [-0.05, y, x], wallMaterials.side, wall);
      }
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: "#c6b79f",
      roughness: 0.7,
    });
    for (const win of windows) {
      const width = win.width,
        height = win.height,
        y = win.sill + height / 2;
      const frame = new THREE.Group();
      frame.userData.windowId = win.id;
      frame.userData.wall = wall;
      const addFrame = (size, pos) => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(...size), frameMaterial);
        f.position.set(...pos);
        f.castShadow = true;
        frame.add(f);
      };
      for (const x of [-width / 2, width / 2, 0])
        addFrame([0.035, height, 0.12], [x, 0, 0]);
      for (const v of [-height / 2, height / 2])
        addFrame([width, 0.035, 0.12], [0, v, 0]);
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(width - 0.045, height - 0.045),
        new THREE.MeshStandardMaterial({
          color: "#dde8e4",
          transparent: true,
          opacity: 0.3,
          roughness: 0.1,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      frame.add(glass);
      if (wall === "back") frame.position.set(win.position, y, 0);
      else {
        frame.position.set(0, y, win.position);
        frame.rotation.y = Math.PI / 2;
      }
      group.add(frame);
    }
  }
  for (const column of room.columns) {
    const m = mesh(
      [column.width, room.height, column.depth],
      [column.x, room.height / 2, column.z],
      wallMaterials.back,
      "back",
    );
    m.userData.columnId = column.id;
    m.rotation.y = column.rotation;
  }
  return group;
}
export { disposeGroup };
