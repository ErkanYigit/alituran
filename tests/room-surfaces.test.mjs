import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRoom, validateSaved } from "../src/three/room-state.js";
import { floorFinishes } from "../src/three/room-finishes.js";
import { makeRoom } from "../src/three/models.js";
import { recolorRoom } from "../src/three/room-surfaces.js";
import { disposeGroup } from "../src/three/engine.js";

test("old room saves receive defaults; custom surfaces round-trip and invalid appearances are rejected", () => {
  const legacy = defaultRoom();
  delete legacy.appearance;
  assert.deepEqual(
    validateSaved({ version: 1, room: legacy }, []),
    defaultRoom(),
  );
  const room = defaultRoom();
  room.appearance = {
    wallColors: { back: "#557766", side: "#D2B39A" },
    floor: { finish: "tile", color: "#998877" },
  };
  const restored = validateSaved(
    JSON.parse(JSON.stringify({ version: 1, room })),
    [],
  );
  assert.deepEqual(restored.appearance, {
    ...room.appearance,
    wallColors: { back: "#557766", side: "#d2b39a" },
  });
  for (const appearance of [
    null,
    {},
    { ...room.appearance, wallColors: { back: "red", side: "#ffffff" } },
    { ...room.appearance, floor: { finish: "unknown", color: "#ffffff" } },
    { ...room.appearance, floor: { finish: "tile", color: 123 } },
  ])
    assert.throws(
      () => validateSaved({ version: 1, room: { ...room, appearance } }, []),
      /Duvar ve zemin/,
    );
  room.appearance.wallColors.back = "#000000";
  assert.equal(defaultRoom().appearance.wallColors.back, "#ede6dc");
});

test("live recoloring preserves geometry, textures and window frames while walls and columns take their colors", () => {
  const room = defaultRoom();
  room.windows.push({
    id: "w",
    wall: "back",
    position: 2,
    width: 1.2,
    height: 1.1,
    sill: 0.9,
  });
  room.columns.push({
    id: "c",
    width: 0.4,
    depth: 0.4,
    x: 3,
    z: 3,
    rotation: 0,
  });
  const model = makeRoom(room);
  const before = [];
  model.traverse((object) => {
    if (object.isMesh)
      before.push({
        object,
        geometry: object.geometry,
        material: object.material,
        color: object.material.color.getHexString(),
        map: object.material.map,
      });
  });
  room.appearance = {
    wallColors: { back: "#335577", side: "#bb6644" },
    floor: { finish: "oak", color: "#887755" },
  };
  recolorRoom(model, room);
  for (const item of before) {
    assert.equal(item.object.geometry, item.geometry);
    assert.equal(item.object.material, item.material);
    assert.equal(item.object.material.map, item.map);
    const surface = item.object.userData.roomSurface;
    const expected =
      { back: "335577", side: "bb6644", floor: "887755" }[surface] ??
      item.color;
    assert.equal(item.object.material.color.getHexString(), expected);
  }
  disposeGroup(model);
});

test("floor finishes are visually distinct and their board/tile scale stays fixed as the room grows", () => {
  const signatures = new Set();
  for (const finish of floorFinishes) {
    const room = defaultRoom();
    room.appearance.floor = { finish: finish.id, color: finish.color };
    const small = makeRoom(room),
      large = makeRoom({
        ...room,
        width: room.width * 2,
        depth: room.depth * 2,
      });
    const floor = small.children.find(
      (object) => object.userData.roomSurface === "floor",
    );
    const grown = large.children.find(
      (object) => object.userData.roomSurface === "floor",
    );
    assert.equal(floor.material.color.getHexString(), finish.color.slice(1));
    assert.ok(new Set(floor.material.map.image.data).size > 10);
    assert.equal(grown.material.map.repeat.x, floor.material.map.repeat.x * 2);
    assert.equal(grown.material.map.repeat.y, floor.material.map.repeat.y * 2);
    signatures.add(
      floor.material.color.getHexString() +
        Buffer.from(floor.material.map.image.data).toString("base64"),
    );
    disposeGroup(small);
    disposeGroup(large);
  }
  assert.equal(signatures.size, floorFinishes.length);
});
