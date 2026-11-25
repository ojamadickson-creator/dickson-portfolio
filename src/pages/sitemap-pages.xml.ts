import type { APIRoute } from "astro";
import { buildUrlSet } from "../lib/sitemap";

/**
 * Same URL list as /sitemap.xml, published at a second path.
 * A sitemap *index* reports "Discovered pages: 0" by design, so this direct
 * urlset gives Search Console a row that can report the real count.
 */
export const GET: APIRoute = async ({ site }) => {
  const body = await buildUrlSet(site);
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};