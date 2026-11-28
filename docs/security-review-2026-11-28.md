# Security and code review — dickson-portfolio

Date: 28 November 2026 (review and remediation)
Scope: `codebase/` — Astro 7 static site on Vercel, plus the vendored practice apps in `public/apps/`.
Method: full source read, `astro check`, `astro build`, `npm audit`, the repo's `audit-site.mjs`, a CSP hash-coverage script, a local Vercel build, live header inspection, a Supabase read test, and pixel comparisons of the practice app before/after the change.

## Verdict

Every code-level finding is fixed and verified. Two items cannot be finished from the repository: the captcha needs its Cloudflare keys in Vercel, and one SQL migration must be run in the Supabase dashboard.

## What changed

| # | Finding | Fix | Verified by |
|---|---|---|---|
| 1 | Tailwind Play CDN executed third-party JS on your origin (`cysa-practice`) | Compiled the CSS with the Tailwind 3.4.17 CLI into `assets/tailwind.css`; the app's classes are covered, including the results-screen classes the old inline snapshot missed | Pixel diff against the CDN version: 0 changed pixels; dynamic classes present in the compiled file |
| 1b | Font Awesome loaded from cdnjs | Vendored `all.min.css` + 3 woff2 files under `assets/fontawesome/` | Icons render; no external URLs left in `public/apps` except Google Fonts (a stylesheet) |
| 2 | Contact form spam surface | Server-side route (`src/pages/api/contact.ts`) with origin check, schema/length validation, honeypot, per-IP rate limit and a server-signed arithmetic question (`src/lib/challenge.ts`, `src/pages/api/challenge.ts`) that every visitor must answer; client no longer talks to Supabase or formsubmit; DB constraints provided in `docs/supabase-contact-constraints.sql` | API: 403 origin, 415 type, 400 validation, 400 wrong/missing/tampered answer, 200 valid, 429 on the 6th; full browser E2E passed locally and on production |
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

1. **The question is live (Production and Preview).** `CHALLENGE_SECRET` is set in Vercel; `/api/challenge/` issues a signed question and `/api/contact/` checks the answer. Turnstile was removed: its managed mode can pass a trusted browser without any interaction, which was not the behaviour wanted here. The old `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` variables are now unused and can be deleted. Trade-off to keep in mind: arithmetic is a speed bump, not bot detection — a script can fetch and solve it. The rate limit and honeypot are what bound abuse; if real spam appears, move to hCaptcha or reCAPTCHA v2, where a checkbox and image challenge are mandatory.
2. **Run the SQL** in `docs/supabase-contact-constraints.sql` so the database enforces the same limits the endpoint does.
3. **`'unsafe-inline'` on `/apps/*`** stays: the vendored apps use inline scripts and inline event handlers. It is scoped to `/apps`, and no third-party scripts remain there.

## Verification log

- `npx astro check` — 0 errors, 0 warnings, 0 hints (35 files).
- `npm run build` — 21 pages, complete.
- `node scripts/audit-site.mjs` — 21 pages, 20 sitemap URLs, no issues.
- CSP hash coverage — every inline `<script>` and `<style>` on all 21 pages is hashed in the emitted policy; 0 problems.
- `npm audit` — 0 vulnerabilities. Adding `@astrojs/vercel` pulled a vulnerable `path-to-regexp` (build-time routing parser), so `package.json` pins it to the patched 6.3.0 via `overrides`.
- Contact route E2E (`scripts/e2e-contact.mjs` against `scripts/mock-supabase.py`): Turnstile widget renders, token issued, submit returns success, one row inserted, no duplicate email; 403 for a foreign origin, 415 for a wrong content type, 400 for bad fields and for a missing token, 429 on the sixth request in the window.
- Adapter: only `/api/contact/` is on-demand; all 21 pages remain static in the CDN output.
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

## Contact route notes (for the next person)

- `src/pages/api/contact.ts` is the only on-demand route (`prerender = false`); everything else is prerendered by `@astrojs/vercel`.
- Supabase URL and publishable key must come from the same project. The Vercel/Supabase integration exports `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for its own database, which does not contain `contact_messages`; mixing one integration value with the default URL fails as 401 and surfaces as `502 storage`. The route reads `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_PUBLISHABLE_KEY` first.
- `scripts/e2e-contact.mjs <url>` drives a real browser over CDP, fills the form and asserts the status text; `scripts/mock-supabase.py` is the local stand-in for Supabase used by that test.
- Local API tests: `CONTACT_NOTIFY=off PUBLIC_SUPABASE_URL=http://127.0.0.1:4399 TURNSTILE_SECRET_KEY=1x0000…AA npx astro dev`.

## Production run after the change

- Pages: 200, one H1, canonical correct; `scripts/sitemap_health.py` 20/20, 0 problems; live CSP hashes cover every inline script/style.
- `/api/contact/`: 403 for a foreign origin, 400 for an invalid email, 400 for a missing token when a secret is configured, 429 after five requests, 200 for a valid submission (one row stored, one notification attempted).
- Browser E2E on the live site: form filled and submitted, success status shown, fallback hidden.
- Two rows labelled "E2E Production Test" (`e2e@example.com`) were created by these tests and can be deleted from the Supabase table.
## Question challenge verification (28 Nov 2026)

- `GET /api/challenge/` → `{"ok":true,"id":"…","question":"What is 3 × 5?"}`; the id is an HMAC-signed payload with a 10-minute expiry.
- Wrong answer, missing answer, and a tampered signature each return `400 {"ok":false,"error":"captcha"}`; the correct answer stores one row.
- Browser E2E on production: question loaded, answered, success message shown, fallback hidden.
- The answer is never trusted from the browser: the server re-derives the operands from the signed id.