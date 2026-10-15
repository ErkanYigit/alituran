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

function shellDistance(x, y, z) {
  const ny = THREE.MathUtils.clamp((y - 0.46) / 0.3, -1, 1);
  const flare = THREE.MathUtils.smoothstep(z, -0.1, 0.32) * 0.025;
  const lateral =
    (Math.abs(x) - 0.36 - 0.052 * Math.abs(ny) ** 1.15 - flare) * 1.8;
  // Compress the transverse radius independently: the side silhouette has
  // much larger upholstered corner radii than the arm's physical thickness.
  const upper =
    roundedBox(lateral, y - 0.675, z + 0.025, 0.185, 0.14, 0.345, 0.135) / 1.4;
  const rear =
    roundedBox(lateral, y - 0.459, z + 0.315, 0.185, 0.285, 0.155, 0.15) / 1.4;
  const lower =
    roundedBox(lateral, y - 0.258, z + 0.015, 0.185, 0.12, 0.33, 0.115) / 1.4;
  const side = blend(blend(upper, rear, 0.06), lower, 0.06);
  const backWidth = 0.405 + 0.06 * ny * ny;
  const backZ = -0.353 + 0.012 * ny;
  const back = roundedBox(
    x,
    y - 0.458,
    z - backZ,
    backWidth,
    0.297,
    0.108,
    0.087,
  );
  return blend(side, back, 0.065);
}

let shellTemplate;
function shellGeometry() {
  if (shellTemplate) return shellTemplate.clone();
  // A bounded, cached marching-tetrahedra surface. Gradients are sampled from
  // the same scalar field and interpolated at the edge crossings; normals
  // stay smooth across tetrahedra and the resulting surface is closed.
  const cells = [52, 38, 46];
  const minimum = [-0.59, 0.09, -0.53];
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

export function nassArmchair(b, product) {
  const { root, mats, attach, soft, box, loop, pillow, leg } = b;
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
  soft("Alt Gövde", [w * 0.95, h * 0.165, d * 0.89], [0, h * 0.225, d * 0.045]);
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
  soft(
    "Oturum Minderi",
    [w * 0.975, h * 0.225, d * 0.91],
    [0, h * 0.437, d * 0.045],
    mats.fabric,
    root,
    0.7,
  );
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
    h * 0.225,
    d * 0.25,
    8,
    h * 0.105,
  );
  headGeometry.scale(1, 1, 0.55);
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
    [0, h * 0.916, -d * 0.325],
    mats.fabric,
  );
  head.rotation.x = -0.055;
  const lumbar = pillow("Bel Minderi", w * 0.405, h * 0.229, [
    0,
    h * 0.66,
    -d * 0.205,
  ]);
  lumbar.scale.z = 0.7;

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
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 3,
      curveSegments: 16,
    });
    geometry.translate(0, 0.008, -0.03);
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
