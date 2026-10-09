import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Reuse the real logo artwork and licensed Pacifico font, rather than redrawing them.
const asset = (path) => fileURLToPath(new URL(path, import.meta.url));
const output = asset("../public/images/social/");
const fontfile = asset("./assets/Pacifico-Regular.ttf");
const red = "#ee6161";
const shadow = "#905050";
const hills = "M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z";

async function lettering(color, width) {
  return sharp({ text: { text: `<span foreground="${color}">Pukki</span>`, font: "Pacifico 180", fontfile, rgba: true, dpi: 144 } })
    .resize({ width }).png().toBuffer();
}

await mkdir(output, { recursive: true });
for (const [filename, width, height] of [["pukki-wide.png", 1200, 630], ["pukki-square.png", 1200, 1200]]) {
  const square = width === height;
  const wordWidth = square ? 530 : 490;
  const santaSize = square ? 360 : 280;
  const word = await lettering(red, wordWidth);
  const wordShadow = await lettering(shadow, wordWidth);
  const wordHeight = (await sharp(word).metadata()).height;
  const santa = await sharp(asset("../public/images/icons/santa-claus.png")).resize(santaSize).png().toBuffer();
  const santaShadow = await sharp(santa).tint(shadow).png().toBuffer();
  const gap = 22;
  const wordLeft = square ? (width - wordWidth) / 2 : (width - santaSize - gap - wordWidth) / 2 + santaSize + gap;
  const wordTop = square ? 680 : (height - wordHeight) / 2 - 16;
  const santaLeft = square ? (width - santaSize) / 2 : (width - santaSize - gap - wordWidth) / 2;
  const santaTop = square ? 250 : (height - santaSize) / 2 - 16;
  const snow = [[110,105,5],[280,60,4],[530,96,6],[780,55,4],[1060,133,6],[1140,310,4],[72,347,5],[960,430,4],[245,453,4],[1050,530,5]];
  const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#f3f0f3"/>
    ${snow.map(([x,y,r]) => `<circle cx="${x}" cy="${y * height / 630}" r="${r}" fill="#fff"/>`).join("")}
    <g transform="translate(0 ${height - 175}) scale(1 1.46)"><path d="${hills}" fill="#e9ecf4"/></g>
    <g transform="translate(1200 ${height - 110}) scale(-1 .92)"><path d="${hills}" fill="#fff"/></g>
  </svg>`);
  await sharp(backdrop).composite([
    { input: santaShadow, left: Math.round(santaLeft), top: Math.round(santaTop + 5) },
    { input: santa, left: Math.round(santaLeft), top: Math.round(santaTop) },
    { input: wordShadow, left: Math.round(wordLeft), top: Math.round(wordTop + 5) },
    { input: word, left: Math.round(wordLeft), top: Math.round(wordTop) },
  ]).png().toFile(`${output}/${filename}`);
  console.log(`${filename}: ${width}x${height}`);
}
