import type { APIRoute } from "astro";

/**
 * Sitemap index. Search Console will not always let you remove a sitemap whose
 * first fetch failed, so this gives a fresh URL that points at the real one.
 * Submitting /sitemap-index.xml creates a new row and a new fetch attempt.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://ojamadickson.xyz")).toString().replace(/\/$/, "");
  const lastmod = new Date().toISOString().slice(0, 10);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${base}/sitemap.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`,
    "</sitemapindex>",
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
