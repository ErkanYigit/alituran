export const extras = [
  {
    id: "coffee-table",
    name: "Alçak Sehpa",
    type: "table",
    dimensions: { width: 95, depth: 65, height: 36 },
    colors: [{ name: "Ceviz", hex: "#85674e" }],
    model3d: null,
  },
  {
    id: "side-table",
    name: "Yan Sehpa",
    type: "table",
    dimensions: { width: 45, depth: 45, height: 52 },
    colors: [{ name: "Meşe", hex: "#b99b74" }],
    model3d: null,
  },
  {
    id: "rug",
    name: "Doğal Halı",
    type: "rug",
    dimensions: { width: 200, depth: 140, height: 2 },
    colors: [{ name: "Kum", hex: "#d7c8b0" }],
    model3d: null,
  },
];
export const defaultRoom = () => ({
  width: 4,
  depth: 5,
  height: 2.7,
  windows: [],
  columns: [],
  furniture: [],
});
export const uid = () => crypto.randomUUID();
export const dimensions = (p) => ({
  width: p.dimensions.width / 100,
  depth: p.dimensions.depth / 100,
  height: p.dimensions.height / 100,
});
export function footprint(item, size) {
  const cos = Math.abs(Math.cos(item.rotation || 0)),
    sin = Math.abs(Math.sin(item.rotation || 0));
  return {
    width: size.width * cos + size.depth * sin,
    depth: size.width * sin + size.depth * cos,
  };
}
export function clampPlacement(item, size, room) {
  const f = footprint(item, size);
  if (f.width > room.width + 0.0001 || f.depth > room.depth + 0.0001)
    return false;
  item.x = Math.max(f.width / 2, Math.min(room.width - f.width / 2, item.x));
  item.z = Math.max(f.depth / 2, Math.min(room.depth - f.depth / 2, item.z));
  return true;
}
export function corners(item, size) {
  const c = Math.cos(item.rotation || 0),
    s = Math.sin(item.rotation || 0);
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, z]) => ({
    x: item.x + ((x * size.width) / 2) * c + ((z * size.depth) / 2) * s,
    z: item.z - ((x * size.width) / 2) * s + ((z * size.depth) / 2) * c,
  }));
}
export function overlaps(a, aSize, b, bSize) {
  const ap = corners(a, aSize),
    bp = corners(b, bSize);
  for (const angle of [a.rotation || 0, b.rotation || 0])
    for (const offset of [0, Math.PI / 2]) {
      const axis = { x: Math.cos(angle + offset), z: Math.sin(angle + offset) };
      const project = (points) =>
        points.map((p) => p.x * axis.x + p.z * axis.z);
      const pa = project(ap),
        pb = project(bp);
      if (
        Math.max(...pa) <= Math.min(...pb) + 0.01 ||
        Math.max(...pb) <= Math.min(...pa) + 0.01
      )
        return false;
    }
  return true;
}
export function validWindow(win, room, existing = []) {
  const length = win.wall === "back" ? room.width : room.depth;
  if (
    !["back", "side"].includes(win.wall) ||
    ![win.position, win.width, win.height, win.sill].every(Number.isFinite) ||
    win.width < 0.3 ||
    win.height < 0.3 ||
    win.sill < 0 ||
    win.position - win.width / 2 < 0.08 ||
    win.position + win.width / 2 > length - 0.08 ||
    win.sill + win.height > room.height - 0.08
  )
    return false;
  return !existing.some(
    (other) =>
      other.id !== win.id &&
      other.wall === win.wall &&
      Math.abs(other.position - win.position) <
        (other.width + win.width) / 2 + 0.06 &&
      win.sill < other.sill + other.height + 0.06 &&
      other.sill < win.sill + win.height + 0.06,
  );
}
export function validateSaved(value, library) {
  if (!value || value.version !== 1 || !value.room)
    throw new Error("Kayıt biçimi geçersiz.");
  const input = value.room;
  if (
    !Number.isFinite(input.width) ||
    input.width < 2 ||
    input.width > 10 ||
    !Number.isFinite(input.depth) ||
    input.depth < 2 ||
    input.depth > 10 ||
    !Number.isFinite(input.height) ||
    input.height < 2 ||
    input.height > 4
  )
    throw new Error("Oda ölçüleri geçersiz.");
  const room = {
    width: input.width,
    depth: input.depth,
    height: input.height,
    windows: [],
    columns: [],
    furniture: [],
  };
  const ids = new Set();
  const checkId = (item) => {
    if (typeof item.id !== "string" || item.id.length > 100 || ids.has(item.id))
      throw new Error("Nesne kimliği geçersiz.");
    ids.add(item.id);
  };
  for (const key of ["windows", "columns", "furniture"])
    if (!Array.isArray(input[key]) || input[key].length > 30)
      throw new Error("Nesne listesi geçersiz.");
  for (const win of input.windows) {
    checkId(win);
    const clean = {
      id: win.id,
      wall: win.wall,
      position: win.position,
      width: win.width,
      height: win.height,
      sill: win.sill,
    };
    if (!validWindow(clean, room, room.windows))
      throw new Error("Pencere konumu geçersiz.");
    room.windows.push(clean);
  }
  for (const column of input.columns) {
    checkId(column);
    const clean = {
      id: column.id,
      width: column.width,
      depth: column.depth,
      x: column.x,
      z: column.z,
      rotation: column.rotation,
    };
    if (
      ![clean.width, clean.depth, clean.x, clean.z, clean.rotation].every(
        Number.isFinite,
      ) ||
      clean.width < 0.15 ||
      clean.width > 2 ||
      clean.depth < 0.15 ||
      clean.depth > 2 ||
      !clampPlacement(clean, clean, room)
    )
      throw new Error("Kolon ölçüsü geçersiz.");
    room.columns.push(clean);
  }
  for (const item of input.furniture) {
    checkId(item);
    const product = library.find((p) => p.id === item.productId);
    const clean = {
      id: item.id,
      productId: item.productId,
      x: item.x,
      z: item.z,
      rotation: item.rotation,
      color: item.color,
    };
    if (
      !product ||
      ![clean.x, clean.z, clean.rotation].every(Number.isFinite) ||
      !/^#[\da-f]{6}$/i.test(clean.color) ||
      !product.colors.some(
        (c) => c.hex.toLowerCase() === clean.color.toLowerCase(),
      ) ||
      !clampPlacement(clean, dimensions(product), room)
    )
      throw new Error("Mobilya bilgisi geçersiz.");
    room.furniture.push(clean);
  }
  return room;
}
