// Static audit of the built site: headings, ids, alts, links, JSON-LD, canonicals, metadata.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(root);

const issues = [];
const ok = [];
const pageUrl = (file) => "/" + path.relative(root, file).replace(/\\/g, "/").replace(/index\.html$/, "").replace(/404\.html$/, "404");

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const url = pageUrl(file);
  const rel = path.relative(root, file);

  // headings
  const h1 = [...html.matchAll(/<h1\b/gi)].length;
  if (h1 !== 1) issues.push(`${rel}: ${h1} <h1> elements (expected 1)`);

  // duplicate ids
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) issues.push(`${rel}: duplicate id(s) ${[...new Set(dupes)].join(", ")}`);

  // images without alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) issues.push(`${rel}: <img> without alt → ${m[0].slice(0, 80)}`);
  }

  // JSON-LD parses
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      issues.push(`${rel}: invalid JSON-LD (${e.message})`);
    }
  }

  // canonical matches the page path
  const canon = html.match(/rel="canonical" href="([^"]+)"/);
  if (!canon) issues.push(`${rel}: missing canonical`);
  else {
    const want = url === "/404" ? "/404" : url;
    const got = new URL(canon[1]).pathname;
    if (!["/404", "/"].includes(url) && got !== want) issues.push(`${rel}: canonical ${got} != ${want}`);
  }

  // metadata length
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || "";
  if (title.length > 65) issues.push(`${rel}: title ${title.length} chars (>65 may truncate in SERPs)`);
  if (desc.length < 50 || desc.length > 165) issues.push(`${rel}: description ${desc.length} chars (aim 50–165)`);

  // internal links resolve
  for (const m of html.matchAll(/href="(\/[^"#?]*)(#[^"]*)?"/g)) {
    const target = m[1];
    if (target.startsWith("/_astro/") || target === "/") continue;
    const clean = target.replace(/\/$/, "");
    const candidates = [
      path.join(root, clean, "index.html"),
      path.join(root, clean),
      path.join(root, clean + ".html"),
    ];
    if (!candidates.some((p) => fs.existsSync(p))) issues.push(`${rel}: broken internal link ${target}`);
  }

  ok.push(rel);
}

// sitemap vs pages
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
for (const loc of locs) {
  const file = loc === "/" ? path.join(root, "index.html") : path.join(root, loc, "index.html");
  if (!fs.existsSync(file)) issues.push(`sitemap lists ${loc} but no page exists`);
}
const builtUrls = pages.map(pageUrl).filter((u) => u !== "/404");
for (const u of builtUrls) if (!locs.includes(u)) issues.push(`page ${u} is missing from sitemap.xml`);

console.log(`pages audited: ${pages.length}`);
console.log(`sitemap urls: ${locs.length}`);
if (!issues.length) console.log("no issues found");
else {
  console.log(`\n${issues.length} issue(s):`);
  for (const i of issues) console.log(" -", i);
}
