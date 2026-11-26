// Generates a 1200x630 social card per page, so every shared link shows a relevant image.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "og");
fs.mkdirSync(outDir, { recursive: true });

const tileMask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" rx="58" fill="#fff"/></svg>`);
const emblem = await sharp(path.join(root, "public", "brand", "emblem-512.png"))
  .resize(300, 300, { fit: "cover" })
  .composite([{ input: await sharp(tileMask).png().toBuffer(), blend: "dest-in" }])
  .png()
  .toBuffer();

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length <= maxChars) line = (line + " " + w).trim();
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

const card = (file, { eyebrow, title, subtitle, meta }) => {
  const titleLines = wrap(title, 26);
  const titleSize = titleLines.length >= 3 ? 46 : titleLines.length === 2 ? 54 : 60;
  const lh = Math.round(titleSize * 1.12);
  const firstBaseline = titleLines.length >= 3 ? 262 : titleLines.length === 2 ? 288 : 306;
  const tspans = titleLines
    .map((line, i) => `<tspan x="452" dy="${i === 0 ? 0 : lh}">${esc(line)}</tspan>`)
    .join("");
  const afterTitle = firstBaseline + (titleLines.length - 1) * lh + 34;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <radialGradient id="glow" cx="18%" cy="30%" r="60%">
        <stop offset="0" stop-color="#1b3a7a" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#070c16" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3b7bff"/>
        <stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="#070c16"/>
    <rect width="1200" height="630" fill="url(#glow)"/>

    <text x="452" y="212" font-family="Segoe UI, Arial, sans-serif" font-size="19"
          letter-spacing="4.2" fill="#8fa2ba">${esc(eyebrow.toUpperCase())}</text>

    <text x="452" y="${firstBaseline}" font-family="Segoe UI, Arial, sans-serif" font-size="${titleSize}"
          font-weight="700" letter-spacing="-1.2" fill="#eef3fa">${tspans}</text>

    <rect x="452" y="${afterTitle}" width="380" height="3" fill="url(#rule)"/>

    <text x="452" y="${afterTitle + 46}" font-family="Segoe UI, Arial, sans-serif" font-size="23"
          fill="#9aabc2">${esc(subtitle)}</text>

    <text x="452" y="${afterTitle + 96}" font-family="Segoe UI, Arial, sans-serif" font-size="19"
          fill="#6f8199">${esc(meta)}</text>

    <text x="70" y="592" font-family="Segoe UI, Arial, sans-serif" font-size="20"
          fill="#3b7bff">ojamadickson.xyz</text>
    <text x="1130" y="592" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="18"
          fill="#54657d">Dickson Ojama · IT Support</text>
  </svg>`;

  return sharp(Buffer.from(svg))
    .composite([{ input: emblem, left: 96, top: 165 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(outDir, file));
};

// ---------- static pages ----------
const jobs = [];
jobs.push(card("home.jpg", {
  eyebrow: "Level 2 IT support",
  title: "Windows, Mac, Microsoft 365 and identity",
  subtitle: "Three years of technical support · CompTIA certified",
  meta: "Lisbon / Almada · onsite or hybrid",
}));
jobs.push(card("about.jpg", {
  eyebrow: "About",
  title: "IT support that gets people back to work",
  subtitle: "CompTIA Security+, Network+, A+, CSIS, CIOS",
  meta: "Hybrid AD, Entra ID and Intune home lab",
}));
jobs.push(card("resume.jpg", {
  eyebrow: "Resume",
  title: "Dickson Ojama — IT Support Technician",
  subtitle: "Service desk, endpoints and Microsoft 365",
  meta: "Download the PDF · ojamadickson.xyz",
}));
jobs.push(card("blog.jpg", {
  eyebrow: "Blog",
  title: "Notes from the desk",
  subtitle: "Practical write-ups from real support work",
  meta: "Tickets, triage and the fixes that stick",
}));
jobs.push(card("apps.jpg", {
  eyebrow: "Apps",
  title: "Practice apps, straight from the browser",
  subtitle: "CompTIA A+, CySA+ and AWS exam simulators",
  meta: "Free · no signup · runs on your device",
}));
jobs.push(card("laboratories.jpg", {
  eyebrow: "Case studies",
  title: "Labs, written like tickets",
  subtitle: "Active Directory, Entra ID, Intune and detection",
  meta: "What was asked, what broke, how it was verified",
}));

// ---------- projects ----------
const projectDir = path.join(root, "src", "content", "projects");
for (const file of fs.readdirSync(projectDir).filter((f) => f.endsWith(".md"))) {
  const raw = fs.readFileSync(path.join(projectDir, file), "utf8");
  const id = file.replace(/\.md$/, "");
  const get = (key) => (raw.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, "m")) || [])[1] || "";
  const title = get("title");
  const code = get("code");
  const track = get("track") === "security" ? "Security lab" : "IT support";
  if (!title) continue;
  jobs.push(card(`project-${id}.jpg`, {
    eyebrow: `Case study · ${code}`,
    title,
    subtitle: track === "Security lab" ? "Security lab" : "IT support & Microsoft 365",
    meta: "Full write-up on ojamadickson.xyz",
  }));
}

// ---------- blog posts ----------
const blogDir = path.join(root, "src", "content", "blog");
if (fs.existsSync(blogDir)) {
  for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))) {
    const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
    const id = file.replace(/\.md$/, "");
    const get = (key) => (raw.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, "m")) || [])[1] || "";
    const title = get("title");
    const date = get("date");
    if (!title) continue;
    const nice = date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
    jobs.push(card(`blog-${id}.jpg`, {
      eyebrow: "Blog",
      title,
      subtitle: nice,
      meta: "Read it on ojamadickson.xyz",
    }));
  }
}

// ---------- apps ----------
const appsSrc = fs.readFileSync(path.join(root, "src", "lib", "apps.ts"), "utf8");
const appBlocks = appsSrc.split(/\{\s*\n\s*slug:/).slice(1);
for (const block of appBlocks) {
  const pick = (key) => (block.match(new RegExp(`${key}:\\s*"([^"]*)"`)) || [])[1] || "";
  const slug = pick("slug");
  const name = pick("name");
  const exam = pick("exam");
  if (!slug) continue;
  jobs.push(card(`app-${slug}.jpg`, {
    eyebrow: `App · ${exam}`,
    title: name,
    subtitle: "Free practice app — runs in the browser",
    meta: "No signup · progress stays on your device",
  }));
}

await Promise.all(jobs);
const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".jpg"));
const total = files.reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);
console.log(`generated ${files.length} social cards, ${Math.round(total / 1024)} KB total`);
