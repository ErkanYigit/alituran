import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Geometry and synthetic surface detail inferred from the four supplied photos.
// These remain approximate models; photographs are not used as flat billboards.
const profiles = new Set([
  "fair-favorite-armchair",
  "corner-01",
  "corner-02",
  "living-set-331-sofa",
  "living-set-331-chair",
]);
const signedPower = (value, exponent) =>
  Math.sign(value) * Math.abs(value) ** exponent;

function texture(kind, repeats = 1) {
  const size = 128,
    data = new Uint8Array(size * size * 4);
  let seed = 179;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = (seed / 4294967296 - 0.5) * 22;
      let shade = 224 + noise;
      if (kind === "grain")
        shade =
          155 + noise * 2 + Math.sin(x * 2.4) * 16 + Math.cos(y * 2.1) * 12;
      if (kind === "cloth")
        shade =
          208 + noise * 0.55 + Math.sin(x * 1.7) * 3 + Math.cos(y * 1.9) * 3;
      if (kind === "wood")
        shade =
          222 +
          Math.sin(x * 0.75 + Math.sin(y * 0.045) * 6) * 17 +
          noise * 0.35;
      if (kind === "damask") {
        const u = (x / size - 0.5) * 2,
          v = (y / size - 0.5) * 2;
        const radius = Math.hypot(u, v),
          angle = Math.atan2(v, u);
        const leaf = Math.sin(radius * 24 + Math.cos(angle * 6) * 3);
        shade = 225 + leaf * 18 + noise * 0.35;
      }
      if (kind === "geometric") {
        const u = (x / size) * 2,
          v = (y / size) * 2;
        const diamond =
          Math.abs(u - Math.round(u)) + Math.abs(v - Math.round(v));
        shade = Math.floor(diamond * 13) % 2 ? 242 : 39;
      }
      if (kind === "terracotta") {
        const ring =
          Math.floor(Math.hypot(x / size - 0.15, y / size - 0.4) * 16) % 3;
        const rgb = ring === 0 ? [165, 73, 36] : [234, 207, 174];
        data.set([...rgb, 255], (y * size + x) * 4);
        continue;
      }
      if (kind === "stripes") {
        const row = Math.floor(y / 10),
          column = Math.floor(x / 22);
        const palette = [
          [237, 225, 205],
          [169, 139, 86],
          [245, 240, 228],
          [122, 115, 103],
        ];
        data.set(
          [...palette[(row + (column % 3 === 0 ? 1 : 0)) % 4], 255],
          (y * size + x) * 4,
        );
        continue;
      }
      const value = THREE.MathUtils.clamp(shade, 0, 255);
      data.set([value, value, value, 255], (y * size + x) * 4);
    }
  const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeats, repeats);
  map.magFilter = THREE.LinearFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.generateMipmaps = true;
  map.anisotropy = 4;
  if (kind !== "grain") map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  return map;
}

function materials(profile, color) {
  const grain = texture("grain", 14);
  const fabric = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.94,
    bumpMap: grain,
    bumpScale: 0.003,
    map: profile.startsWith("living-set")
      ? texture("damask", 3)
      : texture("cloth", 10),
  });
  const seam = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  seam.color.offsetHSL(0, 0, -0.045);
  seam.userData.tintOffset = -0.045;
  const wood = new THREE.MeshStandardMaterial({
    color: profile.startsWith("living-set") ? "#735038" : "#493326",
    roughness: 0.48,
    map: texture("wood", 2),
  });
  const metal = new THREE.MeshStandardMaterial({
    color: "#8b7155",
    metalness: 0.7,
    roughness: 0.42,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: "#fff7ed",
    roughness: 0.92,
    bumpMap: grain,
    bumpScale: 0.002,
    map: texture(
      profile === "corner-01"
        ? "terracotta"
        : profile === "corner-02"
          ? "stripes"
          : "geometric",
    ),
  });
  return { fabric, seam, wood, metal, accent };
}

function builder(profile, color) {
  const root = new THREE.Group(),
    mats = materials(profile, color);
  const attach = (name, geometry, pos, material, parent = root) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...pos);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.colorable =
      material === mats.fabric || material === mats.seam;
    mesh.userData.materialRole =
      material === mats.wood
        ? "wood"
        : material === mats.metal
          ? "metal"
          : mesh.userData.colorable
            ? "fabric"
            : "accent";
    parent.add(mesh);
    return mesh;
  };
  const soft = (
    name,
    size,
    pos,
    material = mats.fabric,
    parent = root,
    exponent = 0.43,
  ) => {
    const geometry = new THREE.SphereGeometry(0.5, 32, 20);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(
        i,
        (signedPower(positions.getX(i) * 2, exponent) * size[0]) / 2,
        (signedPower(positions.getY(i) * 2, exponent) * size[1]) / 2,
        (signedPower(positions.getZ(i) * 2, exponent) * size[2]) / 2,
      );
    }
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return attach(name, geometry, pos, material, parent);
  };
  const box = (
    name,
    size,
    pos,
    material = mats.wood,
    parent = root,
    radius = 0.025,
  ) =>
    attach(
      name,
      new RoundedBoxGeometry(
        ...size,
        3,
        Math.min(radius, ...size.map((n) => n / 3)),
      ),
      pos,
      material,
      parent,
    );
  const tube = (
    name,
    points,
    radius,
    material = mats.seam,
    parent = root,
    closed = false,
  ) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      closed,
      "centripetal",
    );
    return attach(
      name,
      new THREE.TubeGeometry(curve, 64, radius, 6, closed),
      [0, 0, 0],
      material,
      parent,
    );
  };
  const loop = (
    name,
    width,
    depth,
    y,
    material,
    parent = root,
    radius = 0.005,
  ) => {
    const points = Array.from({ length: 64 }, (_, i) => {
      const angle = (i / 64) * Math.PI * 2;
      return [
        (width / 2) * signedPower(Math.cos(angle), 0.4),
        y,
        (depth / 2) * signedPower(Math.sin(angle), 0.4),
      ];
    });
    return tube(name, points, radius, material, parent, true);
  };
  const leg = (x, z, height, parent = root) => {
    const mesh = attach(
      "Ahşap Ayak",
      new THREE.CylinderGeometry(0.032, 0.023, height, 10),
      [x, height / 2, z],
      mats.wood,
      parent,
    );
    mesh.rotation.z = -Math.sign(x) * 0.065;
  };
  const pillow = (
    name,
    width,
    height,
    pos,
    material = mats.fabric,
    parent = root,
    tilt = 0,
  ) => {
    const mesh = soft(name, [width, height, 0.14], pos, material, parent, 0.5);
    mesh.rotation.x = -0.17;
    mesh.rotation.z = tilt;
    return mesh;
  };
  return { root, mats, attach, soft, box, tube, loop, leg, pillow };
}

function fairArmchair(product, color) {
  const b = builder(product.id, color),
    { root, mats, soft, box, tube, loop, leg, pillow } = b;
  const w = product.dimensions.width / 100,
    d = product.dimensions.depth / 100,
    h = product.dimensions.height / 100;
  soft(
    "Gövde",
    [w * 0.88, h * 0.22, d * 0.81],
    [0, h * 0.27, 0.01],
    mats.fabric,
    root,
    0.32,
  );
  loop(
    "Ahşap Bel Kuşağı",
    w * 0.89,
    d * 0.82,
    h * 0.34,
    mats.wood,
    root,
    0.016,
  );
  soft(
    "Oturum Minderi",
    [w * 0.9, h * 0.22, d * 0.79],
    [0, h * 0.46, d * 0.07],
    mats.fabric,
    root,
    0.4,
  );
  const seam = loop("Oturum Dikişi", w * 0.84, d * 0.72, h * 0.515, mats.seam);
  seam.position.z = d * 0.07;
  for (const side of [-1, 1]) {
    const x = side * w * 0.395;
    soft(
      side < 0 ? "Sol Kol" : "Sağ Kol",
      [w * 0.26, h * 0.28, d * 0.65],
      [x, h * 0.62, -0.025],
      mats.fabric,
      root,
      0.7,
    );
    box(
      "Metal Sırt Desteği",
      [0.018, h * 0.3, 0.018],
      [side * w * 0.27, h * 0.7, -d * 0.29],
      mats.metal,
    );
  }
  soft(
    "Sırt Başlığı",
    [w * 0.83, h * 0.25, d * 0.25],
    [0, h * 0.875, -d * 0.3],
    mats.fabric,
    root,
    0.5,
  );
  tube(
    "Sırt Dikişi",
    [
      [-w * 0.36, h * 0.94, -d * 0.19],
      [0, h * 0.965, -d * 0.185],
      [w * 0.36, h * 0.94, -d * 0.19],
    ],
    0.0035,
    mats.seam,
  );
  pillow("Bel Minderi", w * 0.57, h * 0.31, [0, h * 0.625, -d * 0.09]);
  for (const x of [-w * 0.37, w * 0.37])
    for (const z of [-d * 0.3, d * 0.3]) leg(x, z, h * 0.2);
  return root;
}

function woodFramedSeat(product, color) {
  const b = builder(product.id, color),
    { root, mats, soft, box, leg, pillow } = b;
  const w = product.dimensions.width / 100,
    d = product.dimensions.depth / 100,
    h = product.dimensions.height / 100;
  const chair = product.type === "chair",
    count = chair ? 1 : 3;
  soft(
    "Gövde",
    [w * 0.94, h * 0.24, d * 0.88],
    [0, h * 0.29, 0.005],
    mats.fabric,
    root,
    0.3,
  );
  const seatWidth = (w - 0.15) / count;
  for (let i = 0; i < count; i++) {
    const x = -w / 2 + 0.075 + seatWidth * (i + 0.5);
    soft(
      "Oturum " + (i + 1),
      [seatWidth - 0.026, h * 0.2, d * 0.74],
      [x, h * 0.48, d * 0.07],
      mats.fabric,
      root,
      0.35,
    );
    const back = soft(
      "Sırt " + (i + 1),
      [seatWidth - 0.016, h * 0.43, 0.2],
      [x, h * 0.755, -d * 0.33],
      mats.fabric,
      root,
      0.38,
    );
    back.rotation.x = -0.075;
    if (!chair)
      pillow("Sırt Minderi " + (i + 1), seatWidth * 0.86, h * 0.35, [
        x,
        h * 0.68,
        -d * 0.17,
      ]);
  }
  const beam = (name, from, to, thickness = 0.065) => {
    const a = new THREE.Vector3(...from),
      c = new THREE.Vector3(...to),
      delta = c.clone().sub(a);
    const mesh = box(
      name,
      [thickness, delta.length(), thickness],
      a.clone().add(c).multiplyScalar(0.5).toArray(),
      mats.wood,
      root,
      0.025,
    );
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
  };
  for (const side of [-1, 1]) {
    const x = side * (w / 2 - 0.028),
      name = side < 0 ? "Sol Kol" : "Sağ Kol";
    const back = [x, h * 0.73, -d * 0.38],
      front = [x, h * 0.61, d * 0.38],
      foot = [x, 0.04, d * 0.4];
    beam(name + " Ahşap Üst", back, front, 0.072);
    beam(name + " Ahşap Ön", front, foot, 0.07);
    beam(name + " Ahşap Diyagonal", back, foot, 0.075);
    if (chair)
      soft(
        name + " Minderi",
        [0.115, h * 0.15, d * 0.56],
        [x, h * 0.66, -0.025],
        mats.fabric,
        root,
        0.45,
      );
  }
  box("Ahşap Alt Çerçeve", [w * 0.97, 0.05, 0.045], [0, h * 0.17, d * 0.43]);
  for (const x of [-w / 2 + 0.08, w / 2 - 0.08])
    for (const z of [-d * 0.34, d * 0.35]) leg(x, z, h * 0.18);
  if (!chair)
    for (const side of [-1, 1])
      pillow(
        "Desenli Yastık",
        0.36,
        0.39,
        [side * w * 0.32, h * 0.71, -d * 0.055],
        mats.accent,
        root,
        side * -0.11,
      );
  return root;
}

function cornerSofa(product, color) {
  const b = builder(product.id, color),
    { root, mats, attach, soft, box, tube, loop, leg, pillow } = b;
  const w = product.dimensions.width / 100,
    d = product.dimensions.depth / 100,
    h = product.dimensions.height / 100;
  const cream = product.id === "corner-01",
    moduleDepth = cream ? 0.98 : 0.9;
  const armWidth = cream ? 0.25 : 0.27,
    baseY = h * 0.3,
    seatY = h * 0.5;
  const arm = (parent, x, side) => {
    const name = side < 0 ? "Sol Kol" : "Sağ Kol";
    soft(
      name + " Gövdesi",
      [armWidth, h * 0.4, moduleDepth * 0.9],
      [x, h * 0.48, 0],
      mats.fabric,
      parent,
      0.48,
    );
    soft(
      name + " Üst Minderi",
      [armWidth * 1.07, h * 0.19, moduleDepth * 0.94],
      [x, h * 0.64, 0.008],
      mats.fabric,
      parent,
      0.6,
    );
    const outerX = x + side * armWidth * 0.43;
    const points = [
      [outerX, h * 0.51, -moduleDepth * 0.33],
      [outerX, h * 0.5, moduleDepth * 0.3],
      [outerX, h * 0.45, moduleDepth * 0.38],
      [outerX, h * 0.34, moduleDepth * 0.29],
      [outerX, h * 0.34, -moduleDepth * 0.27],
      [outerX, h * 0.4, -moduleDepth * 0.37],
    ];
    tube(
      name + " Ahşap Detayı",
      points,
      cream ? 0.018 : 0.029,
      mats.wood,
      parent,
      true,
    );
  };
  const run = (length, count, armSide, name) => {
    const group = new THREE.Group();
    group.name = name;
    soft(
      "Gövde",
      [length, h * 0.24, moduleDepth * 0.94],
      [0, baseY, 0],
      mats.fabric,
      group,
      0.28,
    );
    loop(
      "Ahşap Bel Kuşağı",
      length * 0.99,
      moduleDepth * 0.94,
      h * 0.335,
      mats.wood,
      group,
      0.015,
    );
    const available = length - armWidth,
      width = available / count;
    const start = -length / 2 + (armSide < 0 ? armWidth : 0);
    for (let i = 0; i < count; i++) {
      const x = start + width * (i + 0.5);
      soft(
        "Oturum " + (i + 1),
        [width - 0.025, h * 0.21, moduleDepth * 0.75],
        [x, seatY, moduleDepth * 0.07],
        mats.fabric,
        group,
        0.35,
      );
      const seam = loop(
        "Oturum Dikişi " + (i + 1),
        width - 0.035,
        moduleDepth * 0.72,
        h * 0.565,
        mats.seam,
        group,
        0.003,
      );
      seam.position.set(x, 0, moduleDepth * 0.07);
      if (cream) {
        const back = soft(
          "Sırt " + (i + 1),
          [width - 0.01, h * 0.47, 0.22],
          [x, h * 0.765, -moduleDepth * 0.35],
          mats.fabric,
          group,
          0.53,
        );
        back.rotation.x = -0.06;
      } else {
        soft(
          "Sırt Alt " + (i + 1),
          [width - 0.018, h * 0.23, 0.22],
          [x, h * 0.625, -moduleDepth * 0.34],
          mats.fabric,
          group,
          0.38,
        );
        soft(
          "Sırt Üst " + (i + 1),
          [width - 0.018, h * 0.22, 0.235],
          [x, h * 0.875, -moduleDepth * 0.35],
          mats.fabric,
          group,
          0.46,
        );
      }
    }
    arm(group, armSide * (length / 2 - armWidth / 2), armSide);
    const px = armSide * (length / 2 - armWidth - 0.18);
    pillow(
      "Desenli Yastık",
      0.37,
      0.39,
      [px, h * 0.755, -moduleDepth * 0.11],
      mats.accent,
      group,
      -armSide * 0.13,
    );
    for (const x of [-length / 2 + 0.14, length / 2 - 0.12])
      for (const z of [-moduleDepth * 0.33, moduleDepth * 0.33])
        leg(x, z, h * 0.19, group);
    return group;
  };
  const mainLength = w - moduleDepth,
    returnLength = d - moduleDepth;
  const main = run(mainLength, cream ? 2 : 3, -1, "Ana Oturma Kolu");
  main.position.set(-w / 2 + mainLength / 2, 0, -d / 2 + moduleDepth / 2);
  root.add(main);
  const corner = new THREE.Group();
  corner.name = "Yuvarlak Köşe Birleşimi";
  corner.position.set(w / 2 - moduleDepth / 2, 0, -d / 2 + moduleDepth / 2);
  root.add(corner);
  soft(
    "Köşe Gövdesi",
    [moduleDepth, h * 0.24, moduleDepth * 0.94],
    [0, baseY, 0],
    mats.fabric,
    corner,
    0.3,
  );
  soft(
    "Köşe Oturumu",
    [moduleDepth * 0.93, h * 0.21, moduleDepth * 0.9],
    [-0.025, seatY, 0.025],
    mats.fabric,
    corner,
    0.4,
  );
  loop(
    "Köşe Ahşap Kuşağı",
    moduleDepth * 0.99,
    moduleDepth * 0.94,
    h * 0.335,
    mats.wood,
    corner,
    0.015,
  );
  const radius = moduleDepth * 0.35,
    backGeometry = new THREE.TorusGeometry(radius, 0.115, 12, 40, Math.PI / 2);
  backGeometry.scale(1, 1, (h * 0.44) / 0.23);
  backGeometry.rotateX(-Math.PI / 2);
  attach("Köşe Sırtı", backGeometry, [0, h * 0.76, 0], mats.fabric, corner);
  for (const [x, z] of [
    [-0.18, -0.07],
    [0.1, 0.14],
  ]) {
    const p = pillow(
      "Köşe Minderi",
      0.37,
      0.37,
      [x, h * 0.75, z],
      mats.fabric,
      corner,
    );
    p.rotation.y = x > 0 ? -Math.PI / 2 : -0.2;
  }
  for (const x of [-moduleDepth * 0.33, moduleDepth * 0.33])
    for (const z of [-moduleDepth * 0.32, moduleDepth * 0.32])
      leg(x, z, h * 0.19, corner);
  const returning = run(returnLength, 2, 1, "Dönen Oturma Kolu");
  returning.rotation.y = -Math.PI / 2;
  returning.position.set(
    w / 2 - moduleDepth / 2,
    0,
    -d / 2 + moduleDepth + returnLength / 2,
  );
  root.add(returning);
  return root;
}

export function photoFurniture(product, color) {
  if (!profiles.has(product.id)) return null;
  const root =
    product.id === "fair-favorite-armchair"
      ? fairArmchair(product, color)
      : product.id.startsWith("corner-")
        ? cornerSofa(product, color)
        : woodFramedSeat(product, color);
  root.userData.photoProfile = product.id;
  return root;
}
