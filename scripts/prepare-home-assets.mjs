// Prepares web-ready assets for the new home page and the intro splash poster.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const WS = "C:\\Ojama";
const ROOT = "C:\\Users\\Ojama\\Documents\\deepseek-harness\\default-workspace";
const REPO = path.join(ROOT, "github", "dickson-portfolio");
const SRC = path.join(ROOT, "mockup3", "img");
const OUT = path.join(REPO, "public", "home");
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  { from: "hero-shield.png", to: "hero-shield.webp", width: 1100 },
  { from: "lock.png", to: "lock.webp", width: 800 },
  { from: "mesh.png", to: "mesh.webp", width: 1600 },
];

for (const j of jobs) {
  const buf = await sharp(path.join(SRC, j.from))
    .resize({ width: j.width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, j.to), buf);
  console.log(`${j.to}  ${(buf.length / 1024).toFixed(0)} KB`);
}

// poster frame for the intro video
const FF = path.join(ROOT, "tools", "ffmpeg", "bin", "ffmpeg-9.1-essentials_build", "bin", "ffmpeg.exe");
const poster = path.join(REPO, "public", "intro-poster.jpg");
spawnSync(FF, ["-y", "-ss", "2.7", "-i", path.join(ROOT, "intro.mp4"), "-frames:v", "1", "-q:v", "3", poster]);
console.log("intro-poster.jpg", (fs.statSync(poster).size / 1024).toFixed(0), "KB");

// the video itself
fs.copyFileSync(path.join(ROOT, "intro.mp4"), path.join(REPO, "public", "intro.mp4"));
console.log("intro.mp4", (fs.statSync(path.join(REPO, "public", "intro.mp4")).size / 1024).toFixed(0), "KB");
