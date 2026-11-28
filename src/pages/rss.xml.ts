import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { profile } from "../lib/profile";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://ojamadickson.xyz")).toString().replace(/\/$/, "");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const items = posts
    .map((post) => {
      const link = `${base}/blog/${post.id}/`;
      return [
        "    <item>",
        `      <title>${esc(post.data.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `      <description>${esc(post.data.description)}</description>`,
        ...post.data.tags.map((t) => `      <category>${esc(t)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${esc(`Blog — ${profile.name}`)}</title>`,
    `    <link>${base}/blog/</link>`,
    `    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />`,
    `    <description>${esc("An IT support specialist moving into defensive cybersecurity: lab walkthroughs, incident response notes and lessons from the pivot.")}</description>`,
    "    <language>en-gb</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
