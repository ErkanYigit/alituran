import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  defaultRoom,
  validWindow,
  validateSaved,
} from "../src/three/room-state.js";
import { makeRoom } from "../src/three/models.js";
import { disposeGroup } from "../src/three/engine.js";

test("new rooms have two valid windows and a column flush with the wall junction", () => {
  const room = defaultRoom();
  assert.equal(room.columns.length, 1);
  const column = room.columns[0];
  assert.equal(column.x - column.width / 2, 0);
  assert.equal(column.z - column.depth / 2, 0);
  assert.equal(column.rotation, 0);
  assert.deepEqual(
    room.windows.map((win) => win.wall),
    ["back", "side"],
  );
  for (const win of room.windows)
    assert.ok(validWindow(win, room, room.windows));
  assert.deepEqual(validateSaved({ version: 1, room }, []), room);
  room.windows.length = 0;
  room.columns[0].x = 2;
  assert.equal(defaultRoom().windows.length, 2);
  assert.equal(defaultRoom().columns[0].x, 0.2);
});

test("removing a wall removes its glass and frames while leaving the corner column and floor", () => {
  const room = defaultRoom();
  const ray = new THREE.Raycaster(
    new THREE.Vector3(2, 1.4, 1),
    new THREE.Vector3(0, 0, -1),
  );
  const visible = makeRoom(room);
  visible.updateMatrixWorld(true);
  assert.ok(ray.intersectObjects(visible.children, true).length > 0);
  room.walls.back = false;
  const removed = makeRoom(room);
  removed.updateMatrixWorld(true);
  assert.equal(ray.intersectObjects(removed.children, true).length, 0);
  assert.equal(
    removed.children.filter((node) => node.userData.windowId).length,
    1,
  );
  assert.ok(removed.children.some((node) => node.userData.wall === "side"));
  room.walls.side = false;
  const open = makeRoom(room);
  assert.equal(open.children.length, 2); // Floor and the independently removable column.
  assert.ok(
    open.children.some((node) => node.userData.columnId === room.columns[0].id),
  );
  room.walls.back = true;
  const restored = makeRoom(room);
  assert.equal(
    restored.children.filter((node) => node.userData.windowId).length,
    1,
  );
  for (const group of [visible, removed, open, restored]) disposeGroup(group);
});

test("removed architecture stays removed in saves; older empty rooms do not receive new defaults", () => {
  const room = defaultRoom();
  room.walls = { back: false, side: true };
  room.windows = [];
  room.columns = [];
  assert.deepEqual(
    validateSaved(JSON.parse(JSON.stringify({ version: 1, room })), []),
    room,
  );
  const legacy = {
    width: 4,
    depth: 5,
    height: 2.7,
    windows: [],
    columns: [],
    furniture: [],
  };
  const restored = validateSaved({ version: 1, room: legacy }, []);
  assert.deepEqual(restored.walls, { back: true, side: true });
  assert.equal(restored.windows.length, 0);
  assert.equal(restored.columns.length, 0);
  for (const walls of [null, {}, { back: "false", side: true }])
    assert.throws(
      () => validateSaved({ version: 1, room: { ...legacy, walls } }, []),
      /Duvar bilgileri/,
    );
});
