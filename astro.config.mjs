import { defineConfig } from "astro/config";

// Change `site` when you add a custom domain (it feeds canonical URLs and the sitemap-style meta tags).
export default defineConfig({
  site: process.env.SITE_URL ?? "https://dickson-ojama.vercel.app",
  trailingSlash: "ignore",
});
