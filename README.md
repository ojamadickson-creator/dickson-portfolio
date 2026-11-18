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

"Latest activity" is pulled from the GitHub API at build time and refreshed in the visitor's browser, so new repositories show up automatically.

## Contact form

Messages go to the `contact_messages` table in Supabase (Table Editor → `contact_messages`). Row Level Security lets the public key insert only, never read, and a trigger caps submissions at 30 per hour. Free Supabase projects pause after a week without activity; if that happens the form shows an email fallback until you restore the project from the dashboard.

## Custom domain later

Vercel → Project → Settings → Domains → add the domain and follow the DNS instructions, then set `SITE_URL` in Environment Variables and redeploy.
