# Security and code review — dickson-portfolio

Date: 28 November 2026 (review and remediation)
Scope: `codebase/` — Astro 7 static site on Vercel, plus the vendored practice apps in `public/apps/`.
Method: full source read, `astro check`, `astro build`, `npm audit`, the repo's `audit-site.mjs`, a CSP hash-coverage script, a local Vercel build, live header inspection, a Supabase read test, and pixel comparisons of the practice app before/after the change.

## Verdict

Every code-level finding is fixed and verified. Two items cannot be finished from the repository: the contact-form spam gate needs a decision about hosting (see "Open decisions"), and one SQL migration must be run in the Supabase dashboard.

## What changed

| # | Finding | Fix | Verified by |
|---|---|---|---|
| 1 | Tailwind Play CDN executed third-party JS on your origin (`cysa-practice`) | Compiled the CSS with the Tailwind 3.4.17 CLI into `assets/tailwind.css`; the app's classes are covered, including the results-screen classes the old inline snapshot missed | Pixel diff against the CDN version: 0 changed pixels; dynamic classes present in the compiled file |
| 1b | Font Awesome loaded from cdnjs | Vendored `all.min.css` + 3 woff2 files under `assets/fontawesome/` | Icons render; no external URLs left in `public/apps` except Google Fonts (a stylesheet) |
| 2 | Contact form spam surface | Client validation kept; honeypot, length caps and a privacy notice added; DB constraints provided in `docs/supabase-contact-constraints.sql` | Build + type check; SQL is ready to run |
| 3 | CSP allowed `'unsafe-inline'` scripts (and `'unsafe-eval'` on /apps) | Astro `security.csp` now emits a hashed `<meta>` policy; the Vercel header is reduced to `frame-ancestors 'self'`; the `/apps` policy drops both CDNs and `'unsafe-eval'` | Hash-coverage script: 0 problems across 21 pages; all pages render |
| 4 | Error path pointed at a missing email link | Added `.form__fallback` with a mailto link | Present in built HTML |
| 5 | Duplicate email when storage failed | The background email now fires only after a successful save; the failure branch sends one | Code review |
| 6 | No privacy notice | Added under the form: what is kept, why, and how to have it deleted (no vendor names in the copy) | Rendered |
| 7 | OG images cached immutably; blog media uncached | `/og` → 86400s; `/blog/**.webp` and `/blog/**.mp4` → 7 days; HTML not matched | Live headers: `/og/blog.jpg` 86400, a post webp 604800, `/blog/` 0 |
| 8 | `sharp` used but undeclared | Added to `devDependencies` | `npm run og` regenerates 16 cards |
| 9 | Two asset scripts hardcoded an old absolute path | Deleted (`prepare-home-assets.mjs`, `build-watermark-assets.mjs`) | `npm run build` clean |
| 10 | Iframe `allow-scripts allow-same-origin` | Left as is: the apps need same-origin storage for progress. Residual risk documented below | Apps load |
| 11 | Content URLs accepted any scheme | `repo`/`video` now require `https://` | Schema build passes |
| 12 | Intro overlay trapped the page without JS | Bundled script (hashed, so CSP-legal) + `@media (scripting: none)` hides the overlay; Escape skips; buttons removed from tab order | Type check, build |
| 13 | `aria-hidden` container with focusable buttons | Buttons are `tabindex="-1"`, Escape added | Code review |
| 14 | Stale RSS description | Updated to the cybersecurity positioning | Build |
| 15 | `?sent=1` faked a success message | Only shown when this browser submitted the native fallback (sessionStorage flag set immediately before) | Code review |
| 16 | `lang="en"` with en-GB content | `lang="en-GB"` | Build |

Also fixed during the review: `scripts/og-images.mjs` still generated the blog card with the retired "Notes from the desk" copy, and its title wrapper dropped words past the third line without an ellipsis.

## Open decisions (need your accounts or a choice)

1. **Contact-form spam gate.** I built a server endpoint (`api/contact.ts`) with origin checks, schema validation, a per-IP rate limit and optional Turnstile — then `vercel build` proved this project's Astro preset answers `/api/*` with **404**. The static Astro preset does not deploy root `api/` functions. A real server gate needs either the Vercel adapter (`@astrojs/vercel` with one non-prerendered route) or a hosted form service with captcha. I removed the endpoint rather than ship a form pointing at a 404; the client path is unchanged and working.
2. **Run the SQL** in `docs/supabase-contact-constraints.sql` so the database enforces the same limits the form does.
3. **`'unsafe-inline'` on `/apps/*`** stays: the vendored apps use inline scripts and inline event handlers. It is scoped to `/apps`, and no third-party scripts remain there.

## Verification log

- `npx astro check` — 0 errors, 0 warnings, 0 hints (35 files).
- `npm run build` — 21 pages, complete.
- `node scripts/audit-site.mjs` — 21 pages, 20 sitemap URLs, no issues.
- CSP hash coverage — every inline `<script>` and `<style>` on all 21 pages is hashed in the emitted policy; 0 problems.
- `npm audit` — 0 vulnerabilities.
- Vercel local build — 21 pages, function packaging checked (this is how the `/api` 404 was caught).
- Supabase — anonymous `GET /rest/v1/contact_messages` returns 401; inserts only.
- Visual checks after CSP: home, about, blog index, blog post, app wrapper and the CySA+ app all render with styles, fonts, badges and icons intact.
- `cysa-practice`: with and without the CDN script, screenshots are pixel-identical; the compiled stylesheet includes the results-screen classes the inline snapshot lacked.

## Residual risks

- **Spam**: without a server-side gate, a bot that ignores the page can still POST to the Supabase REST endpoint. The table is insert-only, the schema limits sizes once the SQL is applied, and the email copy is best-effort — but volume is unbounded.
- **Apps in a same-origin iframe**: acceptable while every app is your own static file; hosting them on a subdomain would remove the parent-page exposure.
- **Email address is public** in the footer and in the form action; it can be harvested regardless of the form.

## Production verification (after deploy, commit 5e938f2)

- Home, about, blog index, blog post and all five app pages: 200, one H1, canonical correct (`scripts/sitemap_health.py`: 20/20 URLs, 0 problems).
- Live `<meta>` CSP present on every page; every inline script and style on four sampled live pages is hashed (0 uncovered).
- Live headers: general CSP is `frame-ancestors 'self'`; `/apps/*` keeps the scoped policy; OG cache 86400, blog media 604800, blog HTML `max-age=0`.
- Visual: home, about, blog post, app wrapper, CySA+ simulator and the study tracker all render with styles, fonts and icons after the CSP change.
