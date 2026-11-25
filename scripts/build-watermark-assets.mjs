// Turns the four generated renders into transparent, vignetted WebP assets for the site.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const gen = "C:\\Users\\Ojama\\Documents\\deepseek-harness\\default-workspace\\generate\\image";
const outDir = "public/watermark";
fs.mkdirSync(outDir, { recursive: true });

const ASSETS = [
  { name: "shield", file: "image-2026-11-25T02-03-59-860Z-vyw6ph-0.png" },
  { name: "padlock", file: "image-2026-11-25T02-09-57-987Z-jxudc0-0.png" },
  { name: "key-badge", file: "image-2026-11-25T02-05-45-149Z-voj1p3-0.png" },
  { name: "biometric", file: "image-2026-11-25T02-07-56-505Z-lxmjji-0.png" },
];

const SIZE = 620;

async function keyAndVignette(src) {
  const { data, info } = await sharp(src)
    .resize(SIZE, SIZE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // opacity from colourfulness: white background -> 0, saturated/dark artwork -> up to 1
    let a = Math.max(1 - r / 255, 1 - g / 255, 1 - b / 255);
    a = Math.min(1, Math.pow(a, 0.85) * 1.2);
    rgba[j] = r;
    rgba[j + 1] = g;
    rgba[j + 2] = b;
    rgba[j + 3] = Math.round(a * 255);
  }

  const keyed = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();

  // bake a soft radial vignette so edges never show as a rectangle
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
    <defs><radialGradient id="m" cx="0.5" cy="0.5" r="0.62">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.6" stop-color="#fff" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#m)"/></svg>`;

  return sharp(keyed)
    .composite([{ input: Buffer.from(mask), blend: "dest-in" }])
    .webp({ quality: 74, alphaQuality: 80, effort: 6 })
    .toBuffer();
}

for (const a of ASSETS) {
  const buf = await keyAndVignette(path.join(gen, a.file));
  const out = path.join(outDir, `${a.name}.webp`);
  fs.writeFileSync(out, buf);
  console.log(`${a.name}.webp  ${(buf.length / 1024).toFixed(0)} KB`);
}
