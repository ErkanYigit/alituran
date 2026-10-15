import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

// The new front, side and rear photos reveal one padded wraparound shell.
// Blend its C-shaped sides into a full back before meshing, so there are no
// intersecting arm capsules, exposed supports or seams at the rear corners.
function roundedBox(x, y, z, bx, by, bz, radius) {
  const qx = Math.abs(x) - bx + radius;
  const qy = Math.abs(y) - by + radius;
  const qz = Math.abs(z) - bz + radius;
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) +
    Math.min(Math.max(qx, qy, qz), 0) -
    radius
  );
}

function blend(a, b, radius) {
  const t = THREE.MathUtils.clamp(0.5 + (b - a) / (2 * radius), 0, 1);
  return b + (a - b) * t - radius * t * (1 - t);
}

// Side elevation traced as one padded C, rather than three overlapping
// capsules. Its large lower return and gently scooped opening are visible
// in both supplied side photographs (coordinates are depth, height).
const sideOutline = new THREE.Shape();
sideOutline.moveTo(-0.29, 0.805);
sideOutline.bezierCurveTo(-0.12, 0.807, 0.1, 0.82, 0.215, 0.81);
sideOutline.bezierCurveTo(0.295, 0.805, 0.325, 0.77, 0.325, 0.705);
sideOutline.bezierCurveTo(0.327, 0.63, 0.318, 0.566, 0.268, 0.552);
sideOutline.bezierCurveTo(0.17, 0.54, -0.07, 0.55, -0.15, 0.534);
sideOutline.bezierCurveTo(-0.245, 0.517, -0.25, 0.427, -0.172, 0.395);
sideOutline.bezierCurveTo(-0.1, 0.37, 0.08, 0.383, 0.19, 0.378);
sideOutline.bezierCurveTo(0.285, 0.376, 0.313, 0.335, 0.31, 0.266);
sideOutline.bezierCurveTo(0.305, 0.19, 0.28, 0.145, 0.215, 0.136);
sideOutline.bezierCurveTo(0.06, 0.12, -0.18, 0.125, -0.275, 0.148);
sideOutline.bezierCurveTo(-0.412, 0.178, -0.457, 0.27, -0.466, 0.405);
sideOutline.bezierCurveTo(-0.477, 0.55, -0.48, 0.665, -0.443, 0.738);
sideOutline.bezierCurveTo(-0.418, 0.792, -0.365, 0.807, -0.29, 0.805);
const outline = sideOutline.getPoints(8);
function profileDistance(z, y) {
  let inside = false,
    distanceSq = Infinity;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[j],
      b = outline[i];
    const dz = b.x - a.x,
      dy = b.y - a.y;
    const lengthSq = dz * dz + dy * dy;
    const t = lengthSq
      ? THREE.MathUtils.clamp(
          ((z - a.x) * dz + (y - a.y) * dy) / lengthSq,
          0,
          1,
        )
      : 0;
    distanceSq = Math.min(
      distanceSq,
      (z - a.x - t * dz) ** 2 + (y - a.y - t * dy) ** 2,
    );
    if (
      a.y > y !== b.y > y &&
      z < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside;
  }
  return Math.sqrt(distanceSq) * (inside ? -1 : 1);
}
function shellDistance(x, y, z) {
  const ny = THREE.MathUtils.clamp((y - 0.465) / 0.31, -1, 1);
  const front = THREE.MathUtils.smoothstep(z, -0.25, 0.28);
  const top = THREE.MathUtils.smoothstep(y, 0.43, 0.69);
  // A broad oval arm nose flares sideways, while the lower return and rear
  // share a softer waist. The round extrusion retains a broad padded face.
  const center =
    0.371 +
    0.022 * ny * ny +
    0.023 * front * top -
    0.02 * (1 - front) * (1 - ny * ny);
  const halfWidth = 0.106 + 0.026 * top * front;
  const radius = 0.09;
  const qx = Math.abs(Math.abs(x) - center) - halfWidth + radius;
  const qp = profileDistance(z, y) + radius;
  const side =
    Math.hypot(Math.max(qx, 0), Math.max(qp, 0)) +
    Math.min(Math.max(qx, qp), 0) -
    radius;
  // The rear is crowned in depth and narrows gently at the waist. Compress
  // its depth separately to retain large radii at the rear's lower corners.
  const backWidth = 0.47 + 0.04 * ny * ny;
  const backZ = -0.365 - 0.024 * (1 - ny * ny) + 0.025 * (x / 0.48) ** 2;
  const backRadius = 0.175 - 0.07 * THREE.MathUtils.smoothstep(y, 0.43, 0.7);
  const back =
    roundedBox(
      x,
      y - 0.445,
      (z - backZ) * 1.6,
      backWidth,
      0.35,
      0.18,
      backRadius,
    ) / 1.3;
  const rearCorner =
    (1 - THREE.MathUtils.smoothstep(z, -0.29, -0.08)) *
    (1 - THREE.MathUtils.smoothstep(y, 0.35, 0.55));
  const cornerRadius =
    0.22 + 0.09 * rearCorner - 0.12 * THREE.MathUtils.smoothstep(y, 0.43, 0.68);
  // The rear underside bows gently down at the centre; only the rear's
  // lower corners receive the larger turn, leaving the front C nose intact.
  const bottomCrown = 0.022 * (x / 0.5) ** 2 * rearCorner;
  const envelope = roundedBox(
    x,
    y - 0.455 - bottomCrown,
    0,
    0.515 + 0.03 * front,
    0.36,
    1,
    cornerRadius,
  );
  return -blend(-blend(side, back, 0.055), -envelope, 0.025);
}

let shellTemplate;
function shellGeometry() {
  if (shellTemplate) return shellTemplate.clone();
  // A bounded, cached marching-tetrahedra surface. Gradients are sampled from
  // the same scalar field and interpolated at the edge crossings; normals
  // stay smooth across tetrahedra and the resulting surface is closed.
  const cells = [52, 38, 46];
  const minimum = [-0.59, 0.06, -0.53];
  const maximum = [0.59, 0.865, 0.385];
  const counts = cells.map((v) => v + 1);
  const step = cells.map((v, i) => (maximum[i] - minimum[i]) / v);
  const total = counts[0] * counts[1] * counts[2];
  const field = new Float32Array(total);
  const gradients = new Float32Array(total * 3);
  const index = (x, y, z) => x + counts[0] * (y + counts[1] * z);
  for (let z = 0; z < counts[2]; z++)
    for (let y = 0; y < counts[1]; y++)
      for (let x = 0; x < counts[0]; x++)
        field[index(x, y, z)] = shellDistance(
          minimum[0] + x * step[0],
          minimum[1] + y * step[1],
          minimum[2] + z * step[2],
        );
  for (let z = 0; z < counts[2]; z++)
    for (let y = 0; y < counts[1]; y++)
      for (let x = 0; x < counts[0]; x++) {
        const i = index(x, y, z) * 3;
        gradients[i] =
          (field[index(Math.min(x + 1, cells[0]), y, z)] -
            field[index(Math.max(x - 1, 0), y, z)]) /
          (2 * step[0]);
        gradients[i + 1] =
          (field[index(x, Math.min(y + 1, cells[1]), z)] -
            field[index(x, Math.max(y - 1, 0), z)]) /
          (2 * step[1]);
        gradients[i + 2] =
          (field[index(x, y, Math.min(z + 1, cells[2]))] -
            field[index(x, y, Math.max(z - 1, 0))]) /
          (2 * step[2]);
      }
  const positions = [],
    normals = [],
    uvs = [];
  const offsets = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ];
  const tetrahedra = [
    [0, 5, 1, 6],
    [0, 1, 2, 6],
    [0, 2, 3, 6],
    [0, 3, 7, 6],
    [0, 7, 4, 6],
    [0, 4, 5, 6],
  ];
  const edge = (a, b) => {
    const t = a.value / (a.value - b.value);
    return {
      p: a.p.clone().lerp(b.p, t),
      n: a.n.clone().lerp(b.n, t).normalize(),
    };
  };
  const triangle = (a, b, c) => {
    const cross = b.p.clone().sub(a.p).cross(c.p.clone().sub(a.p));
    if (cross.lengthSq() < 1e-16) return;
    if (cross.dot(a.n.clone().add(b.n).add(c.n)) < 0) [b, c] = [c, b];
    for (const vertex of [a, b, c]) {
      const { p, n } = vertex;
      positions.push(p.x, p.y, p.z);
      normals.push(n.x, n.y, n.z);
      if (Math.abs(n.x) > 0.65) uvs.push(p.z * 1.3, p.y * 1.3);
      else if (Math.abs(n.y) > 0.65) uvs.push(p.x * 1.3, p.z * 1.3);
      else uvs.push(p.x * 1.3, p.y * 1.3);
    }
  };
  for (let z = 0; z < cells[2]; z++)
    for (let y = 0; y < cells[1]; y++)
      for (let x = 0; x < cells[0]; x++) {
        const ids = offsets.map(([dx, dy, dz]) =>
          index(x + dx, y + dy, z + dz),
        );
        if (ids.every((i) => field[i] < 0) || ids.every((i) => field[i] >= 0))
          continue;
        const cube = offsets.map(([dx, dy, dz], j) => ({
          value: field[ids[j]],
          p: new THREE.Vector3(
            minimum[0] + (x + dx) * step[0],
            minimum[1] + (y + dy) * step[1],
            minimum[2] + (z + dz) * step[2],
          ),
          n: new THREE.Vector3(
            ...gradients.subarray(ids[j] * 3, ids[j] * 3 + 3),
          ),
        }));
        for (const tetrahedron of tetrahedra) {
          const inside = tetrahedron.filter((i) => cube[i].value < 0);
          const outside = tetrahedron.filter((i) => cube[i].value >= 0);
          if (inside.length === 1)
            triangle(...outside.map((i) => edge(cube[inside[0]], cube[i])));
          else if (inside.length === 3)
            triangle(...inside.map((i) => edge(cube[outside[0]], cube[i])));
          else if (inside.length === 2) {
            const a = edge(cube[inside[0]], cube[outside[0]]);
            const b = edge(cube[inside[0]], cube[outside[1]]);
            const c = edge(cube[inside[1]], cube[outside[0]]);
            const d = edge(cube[inside[1]], cube[outside[1]]);
            triangle(a, b, c);
            triangle(c, b, d);
          }
        }
      }
  shellTemplate = new THREE.BufferGeometry();
  shellTemplate.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  shellTemplate.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(normals, 3),
  );
  shellTemplate.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  const unindexed = shellTemplate;
  shellTemplate = mergeVertices(unindexed, 1e-5);
  unindexed.dispose();
  shellTemplate.computeBoundingBox();
  shellTemplate.computeBoundingSphere();
  return shellTemplate.clone();
}

function smoothNormals(geometry) {
  const lp = geometry.attributes.position,
    ln = geometry.attributes.normal;
  geometry.computeVertexNormals();
  const normalGroups = new Map();
  for (let i = 0; i < lp.count; i++) {
    const key = [lp.getX(i), lp.getY(i), lp.getZ(i)]
      .map((v) => Math.round(v * 1e5))
      .join(",");
    if (!normalGroups.has(key))
      normalGroups.set(key, { n: new THREE.Vector3(), ids: [] });
    const group = normalGroups.get(key);
    group.n.add(new THREE.Vector3(ln.getX(i), ln.getY(i), ln.getZ(i)));
    group.ids.push(i);
  }
  for (const { n, ids } of normalGroups.values()) {
    n.normalize();
    for (const i of ids) ln.setXYZ(i, n.x, n.y, n.z);
  }
}

export function nassArmchair(b, product) {
  const { root, mats, attach, soft, box, loop, leg } = b;
  const w = product.dimensions.width / 100;
  const d = product.dimensions.depth / 100;
  const h = product.dimensions.height / 100;
  mats.wood.color.set("#80634c");
  attach(
    "Sırt ve Kol Gövdesi",
    shellGeometry().scale(w, h, d),
    [0, 0, 0],
    mats.fabric,
  );
  const base = soft(
    "Alt Gövde",
    [w * 0.95, h * 0.165, d * 0.89],
    [0, h * 0.225, d * 0.045],
  );
  // The front apron is full width, but its rear is tucked inside the C shell.
  // Without this taper it breaks through the shell's rounded lower corners.
  const tuckRear = (mesh, rearScale) => {
    const p = mesh.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const front = THREE.MathUtils.smoothstep(
        p.getZ(i) / d + 0.045,
        -0.05,
        0.37,
      );
      p.setX(i, p.getX(i) * THREE.MathUtils.lerp(rearScale, 1, front));
    }
    smoothNormals(mesh.geometry);
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
  };
  tuckRear(base, 0.75);
  // The side shell hides the belt. Return only around the two front corners,
  // so no walnut strip cuts through the padded lower C-shaped side lobes.
  const trim = new THREE.Shape();
  trim.moveTo(-0.47, 0.32);
  trim.lineTo(-0.47, 0.42);
  trim.quadraticCurveTo(-0.47, 0.5, -0.38, 0.5);
  trim.lineTo(0.38, 0.5);
  trim.quadraticCurveTo(0.47, 0.5, 0.47, 0.42);
  trim.lineTo(0.47, 0.32);
  trim.lineTo(0.445, 0.32);
  trim.lineTo(0.445, 0.42);
  trim.quadraticCurveTo(0.445, 0.475, 0.38, 0.475);
  trim.lineTo(-0.38, 0.475);
  trim.quadraticCurveTo(-0.445, 0.475, -0.445, 0.42);
  trim.lineTo(-0.445, 0.32);
  trim.closePath();
  const trimGeometry = new THREE.ExtrudeGeometry(trim, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    bevelSegments: 2,
    curveSegments: 24,
  });
  trimGeometry.rotateX(Math.PI / 2);
  trimGeometry.scale(w, h, d);
  attach("Ahşap Ön Kuşak", trimGeometry, [0, h * 0.325, 0], mats.wood);
  const seat = soft(
    "Oturum Minderi",
    [w * 0.975, h * 0.225, d * 0.91],
    [0, h * 0.437, d * 0.045],
    mats.fabric,
    root,
    0.7,
  );
  tuckRear(seat, 0.78);
  const seam = loop(
    "Oturum Dikişi",
    w * 0.94,
    d * 0.87,
    h * 0.495,
    mats.seam,
    root,
    0.002,
  );
  seam.position.z = d * 0.045;
  tuckRear(seam, 0.78);

  // A visible walnut bridge under the separate thin headrest, with short
  // dark pivots. The old long exposed back rods are absent in these photos.
  box(
    "Sırt Başlık Bağlantısı",
    [w * 0.59, h * 0.026, d * 0.069],
    [0, h * 0.792, -d * 0.318],
    mats.wood,
    root,
    0.009,
  );
  for (const side of [-1, 1])
    box(
      "Sırt Başlık Mafsalı",
      [w * 0.04, h * 0.047, d * 0.045],
      [side * w * 0.27, h * 0.806, -d * 0.33],
      mats.wood,
      root,
      0.01,
    );
  const headGeometry = new RoundedBoxGeometry(
    w * 0.79,
    h * 0.267,
    d * 0.25,
    8,
    h * 0.12,
  );
  headGeometry.scale(1, 1, 0.65);
  const headUV = headGeometry.attributes.uv;
  const headPosition = headGeometry.attributes.position;
  for (let i = 0; i < headPosition.count; i++) {
    const x = headPosition.getX(i),
      y = headPosition.getY(i),
      z = headPosition.getZ(i);
    const normal = headGeometry.attributes.normal;
    if (Math.abs(normal.getX(i)) > 0.65) headUV.setXY(i, z * 1.3, y * 1.3);
    else if (Math.abs(normal.getY(i)) > 0.65) headUV.setXY(i, x * 1.3, z * 1.3);
    else headUV.setXY(i, x * 1.3, y * 1.3);
  }
  const head = attach(
    "Sırt Başlığı",
    headGeometry,
    [0, h * 0.937, -d * 0.325],
    mats.fabric,
  );
  head.rotation.x = -0.055;
  // This chair's loose lumbar cushion has filled, nearly straight edges.
  // Keep this geometry local: the shared pillow intentionally pinches other
  // products' decorative cushions and must not alter them with this revision.
  const lumbarSize = new THREE.Vector3(w * 0.445, h * 0.24, d * 0.16);
  // A uniformly subdivided panel retains vertices across the stuffed face;
  // RoundedBoxGeometry concentrates its vertices at the corners instead.
  const lumbarGeometry = new THREE.BoxGeometry(...lumbarSize, 28, 18, 10);
  const lumbarInner = lumbarSize.clone().multiplyScalar(0.5).subScalar(0.038);
  const lp = lumbarGeometry.attributes.position;
  const ln = lumbarGeometry.attributes.normal;
  const lu = lumbarGeometry.attributes.uv;
  for (let i = 0; i < lp.count; i++) {
    const original = new THREE.Vector3(lp.getX(i), lp.getY(i), lp.getZ(i));
    const core = original
      .clone()
      .clamp(lumbarInner.clone().negate(), lumbarInner);
    const rounded = original
      .sub(core)
      .normalize()
      .multiplyScalar(0.038)
      .add(core);
    let { x, y, z } = rounded;
    const nx = x / (w * 0.22),
      ny = y / (h * 0.12);
    const fill = Math.max(0, (1 - nx * nx) * (1 - ny * ny));
    const fold = Math.sin(ny * 21 + nx * 4) * 0.0025 * Math.abs(nx) ** 8;
    z += Math.sign(z) * (0.024 * fill + fold);
    y += 0.004 * Math.sin(nx * 8 + 0.7) * Math.abs(ny) ** 6;
    x *= 1 - 0.025 * ny;
    lp.setXYZ(i, x, y, z);
    if (Math.abs(ln.getX(i)) > 0.65) lu.setXY(i, z * 1.3, y * 1.3);
    else if (Math.abs(ln.getY(i)) > 0.65) lu.setXY(i, x * 1.3, z * 1.3);
    else lu.setXY(i, x * 1.3, y * 1.3);
  }
  // Box panels duplicate UV vertices; average their coincident normals
  // after stuffing deformation to keep the cushion edges smooth.
  smoothNormals(lumbarGeometry);
  const lumbar = attach(
    "Bel Minderi",
    lumbarGeometry,
    [0, h * 0.655, -d * 0.2],
    mats.fabric,
  );
  lumbar.rotation.x = -0.13;

  // Front legs rise over the base upholstery; their rounded shoulders and
  // wider, splayed feet are visible in the straight-on reference photo.
  for (const side of [-1, 1]) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.032, 0);
    shape.lineTo(0.029, 0);
    shape.bezierCurveTo(0.033, 0.08, 0.025, 0.19, 0.018, 0.255);
    shape.bezierCurveTo(0.015, 0.286, -0.019, 0.292, -0.027, 0.262);
    shape.bezierCurveTo(-0.044, 0.19, -0.038, 0.07, -0.032, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 5,
      curveSegments: 16,
    });
    const legPositions = geometry.attributes.position;
    for (let i = 0; i < legPositions.count; i++) {
      const splay =
        1 - THREE.MathUtils.clamp(legPositions.getY(i) / 0.29, 0, 1);
      legPositions.setX(i, legPositions.getX(i) + 0.018 * splay);
      legPositions.setZ(i, legPositions.getZ(i) + 0.018 * splay);
    }
    geometry.computeVertexNormals();
    geometry.translate(0, 0.012, -0.03);
    geometry.scale(w, h, d);
    const frontLeg = attach(
      "Ön Ahşap Ayak",
      geometry,
      [side * w * 0.414, 0, d * 0.49],
      mats.wood,
    );
    frontLeg.scale.x = side;
    leg(side * w * 0.36, -d * 0.345, h * 0.18);
  }
  return root;
}
