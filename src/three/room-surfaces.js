import * as THREE from "three";
import { defaultAppearance, floorFinishes } from "./room-finishes.js";

// Local, deterministic surface patterns. UV repeats represent metres, so
// changing room dimensions reveals more boards/tiles instead of stretching them.
export function floorMaterial(room) {
  const appearance = room.appearance ?? defaultAppearance();
  const finish = floorFinishes.find(
    (item) => item.id === appearance.floor.finish,
  );
  const wood = finish.id === "oak" || finish.id === "walnut";
  const size = 256,
    data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      let tone = 238 + ((noise - Math.floor(noise)) * 2 - 1) * 5;
      if (wood) {
        const board = Math.floor(x / 64);
        const end = (y + (board % 2) * 128) % size;
        tone += Math.sin(x * 1.2 + Math.sin(y * 0.035) * 4) * 7 + board * 2;
        if (x % 64 < 1 || end < 1) tone = 155;
      } else if (finish.id === "tile") {
        if (x < 3 || y < 3) tone = 155;
      } else {
        tone += Math.sin(x * 0.09) * Math.sin(y * 0.07) * 4;
      }
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.min(255, Math.max(0, tone));
      data[i + 3] = 255;
    }
  }
  const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  map.name = `room-floor-${finish.id}`;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.LinearFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.generateMipmaps = true;
  map.repeat.set(
    room.width / (wood ? 0.72 : 0.6),
    room.depth / (wood ? 1.2 : 0.6),
  );
  map.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    name: `room-floor-${finish.id}`,
    color: appearance.floor.color,
    map,
    roughness: finish.roughness,
  });
}

export function recolorRoom(group, room) {
  const appearance = room.appearance ?? defaultAppearance();
  group.traverse((object) => {
    const surface = object.userData.roomSurface;
    if (surface === "floor") object.material.color.set(appearance.floor.color);
    else if (surface === "back" || surface === "side")
      object.material.color.set(appearance.wallColors[surface]);
  });
}
