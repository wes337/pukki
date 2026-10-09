import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const blonde = process.argv.includes("--blonde");
const source = fileURLToPath(new URL(`../../docs/assets/${blonde ? "avatars-blonde-sheet" : "avatars-sheet"}.png`, import.meta.url));
const output = new URL("../public/images/avatars/", import.meta.url);
const names = blonde ? ["blonde-santa", "blonde-braids", "blonde-beard", "blonde-bob", "blonde-grandpa",
  "blonde-grandma", "blonde-pixie", "blonde-elf", "blonde-boy", "blonde-pigtails"]
  : ["santa-curls", "winter-glasses", "winter-earmuffs", "santa-beard", "auburn-elf",
  "penguin", "gingerbread", "polar-bear", "puppy", "cat"];
const { width, height } = await sharp(source).metadata();
await mkdir(output, { recursive: true });
for (const [index, name] of names.entries()) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  const left = Math.round(col * width / 5);
  const top = Math.round(row * height / 2);
  const cell = await sharp(source).extract({ left, top,
    width: Math.round((col + 1) * width / 5) - left,
    height: Math.round((row + 1) * height / 2) - top,
  }).png().toBuffer();
  const trimmed = await sharp(cell).trim().png().toBuffer();
  await sharp(trimmed).resize(208, 208, { fit: "contain", background: "#00000000" })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#00000000" })
    .png().toFile(fileURLToPath(new URL(`${name}.png`, output)));
}
console.log(`Saved ${names.length} avatars.`);
