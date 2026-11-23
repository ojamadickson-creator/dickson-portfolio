# Dickson Ojama — IT support portfolio

Personal portfolio for an IT Support Technician (L1/L2, Microsoft 365, identity) with a security-labs track. Built with [Astro](https://astro.build), hosted free on Vercel, contact form backed by Supabase.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

Needs Node 22.12+.

## Add or edit content

| What | Where |
| --- | --- |
| Name, links, stats, experience, certs, skills | `src/lib/profile.ts` |
| A new case study | add a Markdown file to `src/content/projects/` (copy an existing one; `track: it` or `track: security`) |
| Screenshot for a case study | `public/evidence/` and reference it in the file's `evidence.src` |
| Resume PDF | replace `public/Dickson-Ojama-Resume.pdf` (keep the phone number off the public copy) |
| Repos hidden from "Latest activity" | `HIDDEN_REPOS` in `src/lib/github.ts` |
| Which resume PDF each role page offers | `resumes` in `src/lib/profile.ts` (`/support`, `/soc`, `/sysadmin`) |
| Numbered callouts on a case-study screenshot | `annotations` in the case study's front matter (`x`/`y` are percentages of the image) |
| "Last updated" line on a case study | optional `updated: YYYY-MM-DD` in the front matter |
| AI usage section on the homepage | `aiUsage` in `src/lib/profile.ts` (hidden while it is `null`) |

"Latest activity" is pulled from the GitHub API at build time and refreshed in the visitor's browser, so new repositories show up automatically.

"Recently shipped" reads the latest commit for up to four repos at build time and caches the answers in `.cache/github.json` for 24 hours. If GitHub can't be reached and there is no cache, the strip is left out and the build still succeeds.

## Contact form

Messages go to the `contact_messages` table in Supabase (Table Editor → `contact_messages`). Row Level Security lets the public key insert only, never read, and a trigger caps submissions at 30 per hour. Free Supabase projects pause after a week without activity; if that happens the form shows an email fallback until you restore the project from the dashboard.

## Domain and `SITE_URL`

Canonical links, the sitemap, robots.txt and `og:image` are all built from Astro's `site`, which reads `SITE_URL` and falls back to `https://ojamadickson.xyz` (see `astro.config.mjs`).

To set it in Vercel: Project → Settings → Environment Variables → add `SITE_URL`.

- Production: `https://ojamadickson.xyz` (or leave it unset, the fallback is the same).
- Preview: leave it unset so preview builds still point canonical and `og:image` at the real domain and never compete with it in search. If you want link previews to show a preview deploy's own image, set Preview to that deploy's URL, for example `https://dickson-portfolio-git-my-branch-<team>.vercel.app`, then redeploy.

The variable is read at build time, so changes only apply after a redeploy. To add a new domain: Settings → Domains → add it, follow the DNS instructions, then update `SITE_URL` for Production.
