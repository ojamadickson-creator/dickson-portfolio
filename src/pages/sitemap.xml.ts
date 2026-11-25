import type { APIRoute } from "astro";
import { buildUrlSet } from "../lib/sitemap";

export const GET: APIRoute = async ({ site }) => {
  const body = await buildUrlSet(site);
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};