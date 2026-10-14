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

// RoundedBoxGeometry is deliberately non-indexed. Recomputing its normals
// per triangle after deformation would facet every curved upholstery edge.
// Weld normals by position while keeping each panel's separate texture UVs.
function smoothUpholsteryNormals(geometry) {
  geometry.computeVertexNormals();
  const p = geometry.attributes.position,
    n = geometry.attributes.normal,
    groups = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = [p.getX(i), p.getY(i), p.getZ(i)]
      .map((v) => Math.round(v * 1e5))
      .join(",");
    let entry = groups.get(key);
    if (!entry) {
      entry = { normal: new THREE.Vector3(), ids: [] };
      groups.set(key, entry);
    }
    entry.normal.add(new THREE.Vector3(n.getX(i), n.getY(i), n.getZ(i)));
    entry.ids.push(i);
  }
  for (const { normal, ids } of groups.values()) {
    normal.normalize();
    for (const i of ids) n.setXYZ(i, normal.x, normal.y, normal.z);
  }
}

// Seeded, tileable irregular yarn loops. Shared by albedo and bump so the
// visible mottling agrees with the fibre relief instead of reading as plastic.
function boucle(x, y, size) {
  const cells = 40,
    u = (x / size) * cells,
    v = (y / size) * cells;
  const ix = Math.floor(u),
    iy = Math.floor(v);
  const hash = (a, b) => {
    let n =
      Math.imul((((a % cells) + cells) % cells) + 17, 374761393) ^
      Math.imul((((b % cells) + cells) % cells) + 11, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  let distance = 4;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const a = ix + i,
        b = iy + j;
      const dx = u - a - 0.18 - hash(a, b) * 0.64,
        dy = v - b - 0.18 - hash(b + 7, a + 3) * 0.64;
      distance = Math.min(distance, Math.hypot(dx, dy));
    }
  const loop = Math.exp(-Math.pow((distance - 0.23) / 0.13, 2));
  return { loop, body: Math.exp(-distance * distance * 5) };
}

let yarnField;
function texture(kind, repeats = 1) {
  const size = 256,
    data = new Uint8Array(size * size * 4);
  if ((kind === "grain" || kind === "cloth") && !yarnField) {
    yarnField = new Float32Array(size * size * 2);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const value = boucle(x, y, size),
          i = (y * size + x) * 2;
        yarnField[i] = value.loop;
        yarnField[i + 1] = value.body;
      }
  }
  let seed = 179;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = (seed / 4294967296 - 0.5) * 22;
      let shade = 224 + noise;
      if (kind === "grain" || kind === "cloth") {
        const index = (y * size + x) * 2,
          yarn = { loop: yarnField[index], body: yarnField[index + 1] };
        shade =
          kind === "grain"
            ? 100 + yarn.loop * 110 + yarn.body * 25 + noise * 0.5
            : 224 - yarn.loop * 28 - yarn.body * 9 + noise * 0.4;
      }
      if (kind === "wood")
        shade =
          222 + Math.sin(x * 0.2 + Math.sin(y * 0.025) * 4) * 9 + noise * 0.35;
      if (kind === "damask") {
        // Small woven floral rosettes with nested petal outlines.
        // Keep the contrast low: this is charcoal jacquard, not a printed swirl.
        const u = x / size - 0.5,
          v = y / size - 0.5;
        const r = Math.hypot(u, v),
          theta = Math.atan2(v, u);
        const petals = 0.255 + 0.075 * Math.cos(theta * 8);
        const outer = Math.exp(-Math.pow((r - petals) / 0.018, 2));
        const inner = Math.exp(-Math.pow((r - petals * 0.64) / 0.014, 2));
        const center = Math.exp(-Math.pow((r - 0.065) / 0.012, 2));
        const leaves = Math.exp(
          -Math.pow((r - (0.43 + 0.035 * Math.sin(theta * 4))) / 0.012, 2),
        );
        shade =
          208 +
          Math.min(1, outer + inner + center + leaves * 0.65) * 34 +
          noise * 0.5;
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
        const rgb = ring === 0 ? [218, 187, 150] : [167, 76, 40];
        for (let c = 0; c < 3; c++) rgb[c] += noise * 0.5;
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
  const grain = texture("grain", 4);
  const fabric = new THREE.MeshPhysicalMaterial({
    sheen: 0.8,
    sheenRoughness: 1,
    sheenColor: new THREE.Color(color),
    color,
    roughness: 0.94,
    bumpMap: grain,
    bumpScale: 0.005,
    map: profile.startsWith("living-set")
      ? texture("damask", 7)
      : texture("cloth", 4),
  });
  const seam = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  seam.color.offsetHSL(0, 0, -0.045);
  seam.userData.tintOffset = -0.045;
  const wood = new THREE.MeshStandardMaterial({
    color: profile.startsWith("living-set") ? "#735038" : "#493326",
    roughness: 0.48,
    map: texture("wood", 1),
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
    // A sewn cushion has broad panels and round edge rolls. A transformed
    // sphere pinches both its topology and UVs at the poles, so start with a
    // properly UV-mapped rounded box and inflate the six upholstery panels.
    const radius = Math.min(...size) * (0.27 + exponent * 0.23);
    const geometry = new RoundedBoxGeometry(...size, 4, radius);
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i),
        y = positions.getY(i),
        z = positions.getZ(i);
      const nx = (x * 2) / size[0],
        ny = (y * 2) / size[1],
        nz = (z * 2) / size[2];
      const panel = Math.max(0, (1 - nx * nx) * (1 - nz * nz));
      y += Math.sign(y) * size[1] * 0.065 * panel;
      z +=
        Math.sign(z) *
        size[2] *
        0.045 *
        Math.max(0, (1 - nx * nx) * (1 - ny * ny));
      positions.setXYZ(i, x, y, z);
      // World-scaled panel projections preserve weave scale and avoid stretched
      // ornament on long seat cushions. Normal selection also works in Node.
      const ax = Math.abs(normals.getX(i)),
        ay = Math.abs(normals.getY(i));
      if (ay > 0.7) uv.setXY(i, x * 1.3, z * 1.3);
      else if (ax > 0.7) uv.setXY(i, z * 1.3, y * 1.3);
      else uv.setXY(i, x * 1.3, y * 1.3);
    }
    smoothUpholsteryNormals(geometry);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return attach(name, geometry, pos, material, parent);
  };
  // Sculpted arm shells have continuously curved elliptical sections, not
  // the long flat top of a rounded box. The leading end falls toward the seat.
  const plush = (name, size, pos, side = 0, parent = root) => {
    const geometry = new THREE.SphereGeometry(1, 40, 28);
    const p = geometry.attributes.position,
      uv = geometry.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const sx = p.getX(i),
        sy = p.getY(i),
        sz = p.getZ(i),
        front = (sz + 1) / 2;
      let x = (signedPower(sx, 0.82) * size[0]) / 2;
      const y =
        (signedPower(sy, 0.85) * size[1]) / 2 - size[1] * 0.13 * front * front;
      const z = (signedPower(sz, 0.78) * size[2]) / 2;
      x += side * size[0] * 0.1 * front * front;
      p.setXYZ(i, x, y, z);
      if (Math.abs(sy) > 0.65) uv.setXY(i, x * 1.3, z * 1.3);
      else if (Math.abs(sx) > 0.65) uv.setXY(i, z * 1.3, y * 1.3);
      else uv.setXY(i, x * 1.3, y * 1.3);
    }
    smoothUpholsteryNormals(geometry);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return attach(name, geometry, pos, mats.fabric, parent);
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
    const mesh = box(
      "Ahşap Ayak",
      [0.065, height, 0.072],
      [x, height / 2, z],
      mats.wood,
      parent,
      0.018,
    );
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const taper = 0.65 + (pos.getY(i) / height + 0.5) * 0.35;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
    }
    mesh.geometry.computeVertexNormals();
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
    // Lenticular stuffing and pinched corners give loose cushions their
    // tailored silhouette; slight edge gathers catch the studio light.
    const geometry = new THREE.PlaneGeometry(width, height, 22, 18);
    const positions = [],
      uvs = [],
      indices = [];
    const cols = 23,
      rows = 19;
    for (const side of [1, -1]) {
      const offset = positions.length / 3;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const u = i / (cols - 1),
            v = j / (rows - 1),
            a = 2 * u - 1,
            c = 2 * v - 1;
          const fill = Math.pow(Math.max(0, (1 - a * a) * (1 - c * c)), 0.55);
          const edge = Math.max(Math.abs(a), Math.abs(c));
          const gather =
            Math.sin(u * 51 + v * 9) *
            Math.sin(v * 47 - u * 7) *
            0.004 *
            edge ** 6;
          positions.push(
            ((a * width) / 2) * (0.92 + 0.08 * Math.abs(c)),
            ((c * height) / 2) * (0.92 + 0.08 * Math.abs(a)),
            side * (0.008 + 0.12 * fill) + gather,
          );
          uvs.push(
            material === mats.fabric ? u * width * 1.3 : u,
            material === mats.fabric ? v * height * 1.3 : v,
          );
          if (i < cols - 1 && j < rows - 1) {
            const n = offset + j * cols + i;
            if (side === 1)
              indices.push(n, n + 1, n + cols, n + 1, n + cols + 1, n + cols);
            else
              indices.push(n, n + cols, n + 1, n + 1, n + cols, n + cols + 1);
          }
        }
    }
    // Close the perimeter so loose pillows remain actual volumetric meshes.
    const n = cols * rows;
    const perimeter = [];
    for (let i = 0; i < cols; i++) perimeter.push(i);
    for (let j = 1; j < rows; j++) perimeter.push(j * cols + cols - 1);
    for (let i = cols - 2; i >= 0; i--) perimeter.push((rows - 1) * cols + i);
    for (let j = rows - 2; j > 0; j--) perimeter.push(j * cols);
    perimeter.forEach((a, i) => {
      const c = perimeter[(i + 1) % perimeter.length];
      indices.push(a, c, a + n, c, c + n, a + n);
    });
    geometry.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    const mesh = attach(name, g, pos, material, parent);
    mesh.rotation.x = -0.17;
    mesh.rotation.z = tilt;
    return mesh;
  };
  // Flat wooden ribbons, not round pipes. The ring is extruded in its plane
  // and bevelled at both edges like the continuous walnut frames in the photos.
  const ribbon = (name, points, thickness, breadth, pos, parent = root) => {
    const center = new THREE.Vector2();
    points.forEach((p) => center.add(new THREE.Vector2(...p)));
    center.divideScalar(points.length);
    const shape = new THREE.Shape();
    const outer = points.map((p) => new THREE.Vector2(...p));
    const inner = outer.map((p) => p.clone().lerp(center, breadth));
    const draw = (path, ps) => {
      path.moveTo(ps[0].x, ps[0].y);
      for (let i = 1; i < ps.length; i++) path.lineTo(ps[i].x, ps[i].y);
      path.closePath();
    };
    draw(shape, outer);
    const hole = new THREE.Path();
    draw(hole, inner.reverse());
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      curveSegments: 16,
    });
    g.translate(0, 0, -thickness / 2);
    const mesh = attach(name, g, pos, mats.wood, parent);
    return mesh;
  };

  const band = (name, width, depth, y, parent = root) => {
    const points = Array.from({ length: 64 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2;
      return [
        (width / 2) * signedPower(Math.cos(a), 0.3),
        (depth / 2) * signedPower(Math.sin(a), 0.3),
      ];
    });
    const mesh = ribbon(name, points, 0.012, 0.025, [0, y, 0], parent);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  return {
    root,
    mats,
    attach,
    soft,
    plush,
    box,
    tube,
    loop,
    leg,
    pillow,
    ribbon,
    band,
  };
}

function fairArmchair(product, color) {
  const b = builder(product.id, color),
    { root, mats, soft, plush, box, tube, loop, leg, pillow, band } = b;
  const w = product.dimensions.width / 100,
    d = product.dimensions.depth / 100,
    h = product.dimensions.height / 100;
  soft(
    "Gövde",
    [w * 0.92, h * 0.19, d * 0.84],
    [0, h * 0.245, d * 0.025],
    mats.fabric,
    root,
    0.45,
  );
  const waist = band("Ahşap Bel Kuşağı", w * 0.93, d * 0.85, h * 0.345);
  waist.position.z = d * 0.025;
  soft(
    "Oturum Minderi",
    [w * 0.94, h * 0.245, d * 0.84],
    [0, h * 0.47, d * 0.025],
    mats.fabric,
    root,
    0.6,
  );
  const seam = loop(
    "Oturum Dikişi",
    w * 0.89,
    d * 0.8,
    h * 0.535,
    mats.seam,
    root,
    0.0025,
  );
  seam.position.z = d * 0.025;
  // The back is supported by an upholstered shell beneath the separate headrest.
  soft(
    "Sırt Alt Gövde",
    [w * 0.72, h * 0.3, d * 0.16],
    [0, h * 0.61, -d * 0.3],
    mats.fabric,
    root,
    0.65,
  );
  for (const side of [-1, 1]) {
    const name = side < 0 ? "Sol Kol" : "Sağ Kol";
    const arm = plush(
      name,
      [w * 0.27, h * 0.34, d * 0.7],
      [side * w * 0.385, h * 0.655, -d * 0.025],
      side,
    );
    arm.rotation.x = -0.04;
    arm.rotation.z = side * 0.12;

    box(
      "Sırt Ahşap Desteği",
      [0.035, h * 0.38, 0.04],
      [side * w * 0.28, h * 0.67, -d * 0.32],
      mats.wood,
    );
  }
  const head = soft(
    "Sırt Başlığı",
    [w * 0.8, h * 0.255, d * 0.21],
    [0, h * 0.865, -d * 0.29],
    mats.fabric,
    root,
    0.85,
  );
  head.rotation.x = -0.05;

  pillow("Bel Minderi", w * 0.55, h * 0.3, [0, h * 0.64, -d * 0.035]);
  for (const x of [-w * 0.38, w * 0.38])
    for (const z of [-d * 0.31, d * 0.31]) leg(x, z, h * 0.23);
  return root;
}

function woodFramedSeat(product, color) {
  const b = builder(product.id, color),
    { root, mats, soft, box, leg, pillow, ribbon, loop } = b;
  const w = product.dimensions.width / 100,
    d = product.dimensions.depth / 100,
    h = product.dimensions.height / 100;
  const chair = product.type === "chair",
    count = chair ? 1 : 3;
  soft(
    "Gövde",
    [w * 0.96, h * 0.26, d * 0.88],
    [0, h * 0.29, 0],
    mats.fabric,
    root,
    0.35,
  );
  soft(
    "Sırt Gövdesi",
    [w * 0.96, h * 0.6, d * 0.2],
    [0, h * 0.655, -d * 0.36],
    mats.fabric,
    root,
    0.55,
  );
  const seatWidth = (w - 0.17) / count;
  for (let i = 0; i < count; i++) {
    const x = -w / 2 + 0.085 + seatWidth * (i + 0.5);
    soft(
      "Oturum " + (i + 1),
      [seatWidth - 0.012, h * 0.255, d * 0.75],
      [x, h * 0.435, d * 0.065],
      mats.fabric,
      root,
      0.5,
    );
    const back = soft(
      "Sırt Minderi " + (i + 1),
      [seatWidth - 0.018, h * 0.455, d * 0.24],
      [x, h * 0.725, -d * 0.23],
      mats.fabric,
      root,
      0.65,
    );
    back.rotation.x = -0.15;
    const seam = loop(
      "Oturum Dikişi " + i,
      seatWidth - 0.045,
      d * 0.7,
      h * 0.49,
      mats.seam,
      root,
      0.002,
    );
    seam.position.set(x, 0, d * 0.065);
  }
  for (const side of [-1, 1]) {
    const name = side < 0 ? "Sol Kol" : "Sağ Kol",
      x = side * (w / 2 - 0.025);
    // A continuous, broad triangular walnut frame with rounded mitres.
    // XY here is (depth,height); rotation maps its plane onto the chair side.
    const pts = [
      [-d * 0.4, h * 0.64],
      [-d * 0.37, h * 0.7],
      [d * 0.37, h * 0.7],
      [d * 0.43, h * 0.65],
      [d * 0.43, h * 0.08],
      [d * 0.37, h * 0.045],
      [d * 0.29, h * 0.075],
      [-d * 0.4, h * 0.57],
    ];
    const frame = ribbon(name + " Ahşap Çerçeve", pts, 0.055, 0.22, [x, 0, 0]);
    frame.rotation.y = -Math.PI / 2;
    soft(
      name + " Yan Döşeme",
      [0.105, h * 0.42, d * 0.8],
      [x - side * 0.045, h * 0.4, -d * 0.005],
      mats.fabric,
      root,
      0.45,
    );
    if (chair)
      soft(
        name + " Üst Minderi",
        [0.135, h * 0.15, d * 0.59],
        [x, h * 0.7, -d * 0.035],
        mats.fabric,
        root,
        0.75,
      );
  }
  box(
    "Ahşap Alt Çerçeve",
    [w * 0.97, 0.06, d * 0.89],
    [0, h * 0.17, 0],
    mats.wood,
    root,
    0.02,
  );
  for (const x of [-w / 2 + 0.085, w / 2 - 0.085])
    for (const z of [-d * 0.34, d * 0.35]) leg(x, z, h * 0.18);
  if (!chair)
    for (const side of [-1, 1])
      pillow(
        "Desenli Yastık",
        0.36,
        0.4,
        [side * w * 0.32, h * 0.71, -d * 0.04],
        mats.accent,
        root,
        -side * 0.12,
      );
  return root;
}

function cornerSofa(product, color) {
  const b = builder(product.id, color),
    {
      root,
      mats,
      attach,
      soft,
      plush,
      box,
      tube,
      loop,
      leg,
      pillow,
      ribbon,
      band,
    } = b;
  const w = product.dimensions.width / 100,
    d = product.dimensions.depth / 100,
    h = product.dimensions.height / 100;
  const cream = product.id === "corner-01",
    moduleDepth = cream ? 1.03 : 1.02;
  const armWidth = cream ? 0.25 : 0.27,
    baseY = h * 0.285,
    seatY = h * 0.48;
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
    plush(
      name + " Üst Minderi",
      [armWidth * 1.2, h * 0.26, moduleDepth * 0.96],
      [x, h * 0.655, 0.005],
      side,
      parent,
    );
    const outerX = x + side * armWidth * 0.49;
    const pts = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      return [
        moduleDepth * 0.4 * signedPower(Math.cos(a), 0.45),
        h * 0.46 + h * 0.13 * signedPower(Math.sin(a), 0.5),
      ];
    });
    if (cream) {
      // A shallow curved walnut ribbon lies just below the cream arm roll.
      const trim = box(
        name + " Ahşap Detayı",
        [0.035, 0.045, moduleDepth * 0.72],
        [outerX, h * 0.54, 0],
        mats.wood,
        parent,
        0.015,
      );
      trim.rotation.x = 0.08;
    } else {
      const frame = ribbon(
        name + " Ahşap Detayı",
        pts,
        0.026,
        0.23,
        [outerX, 0, 0],
        parent,
      );
      frame.rotation.y = Math.PI / 2;
      const top = plush(
        name + " Gevşek Minder",
        [armWidth * 1.05, h * 0.22, moduleDepth * 0.74],
        [x, h * 0.77, -0.025],
        side,
        parent,
      );
      top.rotation.z = -side * 0.24;
    }
  };

  const run = (length, count, armSide, name) => {
    const group = new THREE.Group();
    group.name = name;
    soft(
      "Gövde",
      [length + 0.015, h * 0.24, moduleDepth * 0.97],
      [0, baseY, 0],
      mats.fabric,
      group,
      0.28,
    );
    band(
      "Ahşap Bel Kuşağı",
      length + 0.012,
      moduleDepth * 0.97,
      h * 0.365,
      group,
    );
    soft(
      "Sırt Ana Gövdesi",
      [length - armWidth * 0.5, h * 0.52, 0.18],
      [-armSide * armWidth * 0.25, h * 0.71, -moduleDepth * 0.39],
      mats.fabric,
      group,
      0.65,
    );
    const available = length - armWidth,
      width = available / count;
    const start = -length / 2 + (armSide < 0 ? armWidth : 0);
    for (let i = 0; i < count; i++) {
      const x = start + width * (i + 0.5);
      soft(
        "Oturum " + (i + 1),
        [width - 0.012, h * 0.26, moduleDepth * 0.8],
        [x, seatY, moduleDepth * 0.07],
        mats.fabric,
        group,
        0.35,
      );
      const seam = loop(
        "Oturum Dikişi " + (i + 1),
        width - 0.035,
        moduleDepth * 0.76,
        h * 0.545,
        mats.seam,
        group,
        0.003,
      );
      seam.position.set(x, 0, moduleDepth * 0.07);
      if (cream) {
        const back = soft(
          "Sırt " + (i + 1),
          [width - 0.008, h * 0.46, 0.255],
          [x, h * 0.765, -moduleDepth * 0.32],
          mats.fabric,
          group,
          0.53,
        );
        back.rotation.x = -0.06;
      } else {
        soft(
          "Sırt Alt " + (i + 1),
          [width - 0.008, h * 0.255, 0.26],
          [x, h * 0.65, -moduleDepth * 0.31],
          mats.fabric,
          group,
          0.38,
        );
        soft(
          "Sırt Üst " + (i + 1),
          [width - 0.008, h * 0.23, 0.26],
          [x, h * 0.895, -moduleDepth * 0.34],
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
    pillow(
      cream ? "Sırt Dekor Minderi" : "Desenli Yastık İç",
      0.38,
      0.4,
      [-armSide * length * 0.22, h * 0.77, -moduleDepth * 0.1],
      cream ? mats.fabric : mats.accent,
      group,
      armSide * 0.08,
    );
    for (const x of [-length / 2 + 0.14, length / 2 - 0.12])
      for (const z of [-moduleDepth * 0.33, moduleDepth * 0.33])
        leg(x, z, h * 0.19, group);
    return group;
  };
  const mainLength = w - moduleDepth,
    returnLength = d - moduleDepth;
  const main = run(mainLength, 2, -1, "Ana Oturma Kolu");
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
    [moduleDepth * 1.01, h * 0.26, moduleDepth * 0.98],
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
  // Bend a real padded back panel through 90 degrees. Unlike a torus its
  // vertical profile stays broad, and its endpoints meet both straight backs.
  const backGeometry = new RoundedBoxGeometry(
    (moduleDepth * 0.86 * Math.PI) / 2,
    h * 0.46,
    0.255,
    5,
    0.095,
  );
  const pp = backGeometry.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const angle =
      ((pp.getX(i) / ((moduleDepth * 0.86 * Math.PI) / 2) + 0.5) * Math.PI) / 2;
    const radial = moduleDepth * 0.86 - pp.getZ(i);
    pp.setXYZ(
      i,
      -moduleDepth * 0.5 + radial * Math.sin(angle),
      pp.getY(i),
      moduleDepth * 0.5 - radial * Math.cos(angle),
    );
  }
  smoothUpholsteryNormals(backGeometry);
  attach("Köşe Sırtı", backGeometry, [0, h * 0.765, 0], mats.fabric, corner);
  if (!cream) {
    const points = Array.from({ length: 32 }, (_, i) => {
      const a = ((i / 31) * Math.PI) / 2;
      return [
        -moduleDepth * 0.5 + moduleDepth * 0.73 * Math.sin(a),
        h * 0.77,
        moduleDepth * 0.5 - moduleDepth * 0.73 * Math.cos(a),
      ];
    });
    tube("Köşe Sırt Panel Dikişi", points, 0.006, mats.seam, corner);
  }
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
