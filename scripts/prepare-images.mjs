import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";
const root = "public/assets/images";
let count = 0;
for (const relative of await readdir(root, { recursive: true })) {
  if (!/\.(webp|png|jpe?g)$/i.test(relative) || /-w\d+\.webp$/.test(relative))
    continue;
  const source = join(root, relative),
    parts = parse(source);
  for (const width of [320, 640, 1024, 1536])
    await sharp(source)
      .resize({ width })
      .webp({ quality: 82 })
      .toFile(join(parts.dir, `${parts.name}-w${width}.webp`));
  count++;
}
console.log(`Prepared responsive variants for ${count} local images`);
