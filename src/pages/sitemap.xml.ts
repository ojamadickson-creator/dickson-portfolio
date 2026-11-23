import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://ojamadickson.xyz")).toString().replace(/\/$/, "");
  const projects = await getCollection("projects");
  const urls = [
    "/",
    "/resume/",
    "/support/",
    "/soc/",
    "/sysadmin/",
    ...projects.map((p) => `/projects/${p.id}/`),
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${base}${u}</loc><lastmod>${lastmod}</lastmod></url>`),
    "</urlset>",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
