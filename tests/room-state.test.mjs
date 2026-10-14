import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import products from "../src/data/products.json" with { type: "json" };
import {
  proceduralFurniture,
  makeRoom,
  replaceColor,
} from "../src/three/models.js";
import { disposeGroup } from "../src/three/engine.js";
import {
  defaultRoom,
  dimensions,
  clampPlacement,
  overlaps,
  validWindow,
  validateSaved,
  extras,
  furnitureLibrary,
  startingFurniture,
} from "../src/three/room-state.js";

test("every procedural product has its configured real-world dimensions and rests on the floor", () => {
  for (const product of [...products, ...extras]) {
    const mesh = proceduralFurniture(product),
      box = new THREE.Box3().setFromObject(mesh),
      actual = box.getSize(new THREE.Vector3()),
      expected = dimensions(product);
    assert.ok(
      Math.abs(actual.x - expected.width) < 0.00001,
      product.id + " width",
    );
    assert.ok(
      Math.abs(actual.y - expected.height) < 0.00001,
      product.id + " height",
    );
    assert.ok(
      Math.abs(actual.z - expected.depth) < 0.00001,
      product.id + " depth",
    );
    assert.ok(Math.abs(box.min.y) < 0.00001, product.id + " floor");
  }
});
test("rotated furniture stays inside the room, oversized pieces are rejected", () => {
  const room = defaultRoom(),
    size = { width: 2.8, depth: 1.9 };
  const item = { x: -10, z: 10, rotation: Math.PI / 2 };
  assert.equal(clampPlacement(item, size, room), true);
  assert.ok(Math.abs(item.x - 0.95) < 0.00001);
  assert.ok(Math.abs(item.z - 3.6) < 0.00001);
  assert.equal(
    clampPlacement({ x: 0, z: 0, rotation: 0 }, { width: 6, depth: 1 }, room),
    false,
  );
});
test("overlap detection accounts for rotated shapes and allows touching edges", () => {
  const size = { width: 2, depth: 1 };
  assert.equal(
    overlaps(
      { x: 2, z: 2, rotation: 0 },
      size,
      { x: 2.4, z: 2, rotation: Math.PI / 4 },
      size,
    ),
    true,
  );
  assert.equal(
    overlaps(
      { x: 2, z: 2, rotation: 0 },
      size,
      { x: 4, z: 2, rotation: 0 },
      size,
    ),
    false,
  );
  assert.equal(
    overlaps(
      { x: 1, z: 1, rotation: 0 },
      size,
      { x: 4, z: 4, rotation: 0 },
      size,
    ),
    false,
  );
});
test("windows must fit wall boundaries and cannot overlap", () => {
  const room = defaultRoom(),
    win = {
      id: "w",
      wall: "back",
      position: 2,
      width: 1.2,
      height: 1.1,
      sill: 0.9,
    };
  assert.equal(validWindow(win, room), true);
  assert.equal(validWindow({ ...win, position: 0.1 }, room), false);
  assert.equal(validWindow({ ...win, sill: 2 }, room), false);
  assert.equal(validWindow({ ...win, id: "second" }, room, [win]), false);
  assert.equal(validWindow({ ...win, wall: "side" }, room, [win]), true);
});
test("window is a real hole in wall box geometry", () => {
  const room = defaultRoom();
  room.windows = [
    { id: "w", wall: "back", position: 2, width: 1.2, height: 1.1, sill: 0.9 },
  ];
  const group = makeRoom(room);
  group.updateMatrixWorld(true);
  const walls = group.children.filter((c) => c.isMesh);
  const ray = new THREE.Raycaster(
    new THREE.Vector3(2, 1.4, 1),
    new THREE.Vector3(0, 0, -1),
  );
  assert.equal(ray.intersectObjects(walls, false).length, 0);
  ray.set(new THREE.Vector3(0.3, 1.4, 1), new THREE.Vector3(0, 0, -1));
  assert.ok(ray.intersectObjects(walls, false).length > 0);
});
test("saved room round-trips, and corrupted or unrecognized models are rejected", () => {
  const room = defaultRoom();
  room.furniture = [
    {
      id: "f",
      productId: products[0].id,
      x: 2,
      z: 2.5,
      rotation: 0,
      color: products[0].colors[0].hex,
    },
  ];
  const saved = { version: 1, room };
  assert.deepEqual(
    validateSaved(JSON.parse(JSON.stringify(saved)), [...products, ...extras]),
    room,
  );
  assert.throws(() => validateSaved({ ...saved, version: 99 }, products));
  assert.throws(() =>
    validateSaved({ version: 1, room: { ...room, width: Infinity } }, products),
  );
  assert.throws(() =>
    validateSaved(
      {
        version: 1,
        room: {
          ...room,
          furniture: [{ ...room.furniture[0], productId: "unknown" }],
        },
      },
      products,
    ),
  );
  assert.throws(() =>
    validateSaved(
      {
        version: 1,
        room: {
          ...room,
          furniture: [
            { ...room.furniture[0], color: "url(javascript:alert(1))" },
          ],
        },
      },
      products,
    ),
  );
});
test("catalog IDs and slugs are stable and unique; model and image sources are local", () => {
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  assert.equal(new Set(products.map((p) => p.slug)).size, products.length);
  for (const p of products) {
    assert.match(p.slug, /^[a-z0-9-]+$/);
    assert.ok(p.images.every((image) => image.startsWith("/assets/images/")));
    assert.ok(
      p.dimensions.width > 0 &&
        p.dimensions.depth > 0 &&
        p.dimensions.height > 0,
    );
  }
});
test("3+3+1 opens as two sofas and a chair with independent sizes, fits without overlap and survives saved-room validation", () => {
  const set = products.find((p) => p.type === "set"),
    room = defaultRoom();
  const library = [...furnitureLibrary(products), ...extras];
  room.furniture = startingFurniture(set, room);
  assert.deepEqual(
    room.furniture.map((p) => p.productId),
    ["living-set-331-sofa", "living-set-331-sofa", "living-set-331-chair"],
  );
  assert.equal(new Set(room.furniture.map((p) => p.id)).size, 3);
  for (const [i, item] of room.furniture.entries()) {
    const product = library.find((p) => p.id === item.productId);
    const original = { ...item };
    assert.equal(clampPlacement(item, dimensions(product), room), true);
    assert.deepEqual(item, original);
    for (const other of room.furniture.slice(i + 1)) {
      assert.equal(
        overlaps(
          item,
          dimensions(product),
          other,
          dimensions(library.find((p) => p.id === other.productId)),
        ),
        false,
      );
    }
  }
  assert.deepEqual(validateSaved({ version: 1, room }, library), room);
});
test("detailed models have finite mesh data and stay within a mobile-friendly geometry budget", () => {
  for (const product of [...products, ...furnitureLibrary(products)]) {
    const model = proceduralFurniture(product);
    let triangles = 0;
    model.traverse((object) => {
      if (!object.isMesh) return;
      const positions = object.geometry.attributes.position;
      assert.ok(Array.from(positions.array).every(Number.isFinite), product.id);
      triangles += (object.geometry.index?.count || positions.count) / 3;
    });
    assert.ok(triangles < 100000, `${product.id}: ${triangles} triangles`);
    disposeGroup(model);
  }
});
test("recoloring fabric preserves timber, metal and decorative pillow colors", () => {
  for (const product of products) {
    const model = proceduralFurniture(product);
    const fixed = [],
      fabric = [];
    model.traverse((object) => {
      if (!object.isMesh) return;
      if (object.userData.colorable && !object.material.userData.tintOffset)
        fabric.push(object.material);
      else if (!object.userData.colorable)
        fixed.push([object.material, object.material.color.getHex()]);
    });
    assert.ok(fabric.length > 0, product.id + " fabric");
    assert.ok(fixed.length > 0, product.id + " trim");
    replaceColor(model, "#3e7b50");
    for (const material of fabric) {
      assert.equal(material.color.getHexString(), "3e7b50");
      if (material.sheenColor)
        assert.equal(material.sheenColor.getHexString(), "3e7b50");
    }
    for (const [material, original] of fixed)
      assert.equal(material.color.getHex(), original);
    disposeGroup(model);
  }
});
