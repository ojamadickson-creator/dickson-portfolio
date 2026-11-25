#!/usr/bin/env node
/**
 * Push every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 * Google does not use IndexNow — for Google, submit the sitemap once in Search
 * Console; after that Google re-reads it on its own schedule.
 *
 * Usage:  npm run indexnow
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE = process.env.SITE_URL ?? "https://ojamadickson.xyz";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const keyFile = fs
  .readdirSync(path.join(root, "public"))
  .find((f) => /^[a-f0-9]{32}\.txt$/.test(f));

if (!keyFile) {
  console.error("No IndexNow key file found in public/ (expected a 32-char hex .txt).");
  process.exit(1);
}

const key = keyFile.replace(/\.txt$/, "");
const keyLocation = `${SITE}/${keyFile}`;

const sitemapRes = await fetch(`${SITE}/sitemap.xml`);
if (!sitemapRes.ok) {
  console.error(`Could not fetch sitemap: ${sitemapRes.status}`);
  process.exit(1);
}
const sitemap = await sitemapRes.text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

console.log(`Submitting ${urlList.length} URL(s) to IndexNow as ${SITE}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key,
    keyLocation,
    urlList,
  }),
});

const body = await res.text().catch(() => "");
console.log(`IndexNow responded ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 300)}` : ""}`);
if (![200, 202].includes(res.status)) process.exit(1);
