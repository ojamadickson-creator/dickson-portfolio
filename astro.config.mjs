import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

// Change `site` when you add a custom domain (it feeds canonical URLs and the sitemap-style meta tags).
export default defineConfig({
  site: process.env.SITE_URL ?? "https://ojamadickson.xyz",
  trailingSlash: "always",
  // Only /api/contact is rendered on demand; every page stays prerendered. The adapter is what
  // lets Vercel run that one route (without it, /api/* answers 404).
  adapter: vercel(),
  output: "static",
  // Adds a hashed <meta> CSP to every page, so inline scripts no longer need 'unsafe-inline'.
  // Files under /public (the vendored apps) are not processed by Astro; they keep the policy
  // declared in vercel.json.
  security: {
    csp: {
      algorithm: "SHA-256",
      styleDirective: {
        // External font stylesheets stay allowed; only inline style *attributes* need
        // 'unsafe-inline'. Astro still hashes the <style> elements.
        resources: [
          "'self'",
          "https://api.fontshare.com",
          "https://fonts.googleapis.com",
          "https://hcaptcha.com",
          "https://*.hcaptcha.com",
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
      scriptDirective: {
        // hCaptcha widget, only loaded when PUBLIC_HCAPTCHA_SITE_KEY is set.
        resources: ["https://hcaptcha.com", "https://*.hcaptcha.com"],
      },
      directives: [
        "default-src 'self'",
        "font-src 'self' data: https://cdn.fontshare.com https://fonts.gstatic.com",
        "img-src 'self' data: https://*.hcaptcha.com",
        "media-src 'self'",
        // The browser only talks to the contact endpoint on this origin; Supabase and the
        // email relay are reached by the server, so neither is named in the page.
        "connect-src 'self' https://api.github.com https://vitals.vercel-insights.com https://hcaptcha.com https://*.hcaptcha.com",
        "form-action 'self'",
        "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
        "object-src 'none'",
        "base-uri 'self'",
      ],
    },
  },
});
