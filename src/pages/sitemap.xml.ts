import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://ojamadickson.xyz")).toString().replace(/\/$/, "");
  const projects = await getCollection("projects");
  const urls: { loc: string; priority: string }[] = [
    { loc: "/", priority: "1.0" },
    { loc: "/about/", priority: "0.9" },
    { loc: "/resume/", priority: "0.9" },
    ...projects.map((p) => ({ loc: `/projects/${p.id}/`, priority: "0.8" })),
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${base}${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
