# Making ojamadickson.xyz feel exceptional

Written after reading the repo and the live site. Two parts: what I already built (uncommitted, review with `git diff`), then the ideas I did not build, each with the reason it works and the steps to do it.

---

## Part 1 - Built in the repo (uncommitted)

| Change | Files | Why it matters |
|---|---|---|
| Canonical, og:url, og:image and JSON-LD `url` now resolve to `https://ojamadickson.xyz` | `astro.config.mjs` | They all pointed at `dickson-portfolio-phi.vercel.app`, which serves a live 200 duplicate. Your custom domain was declaring the Vercel host canonical |
| `/robots.txt` and `/sitemap.xml` generated at build | `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts` | Both were 404. No sitemap means the case studies compete for indexing with nothing |
| Security in the main nav and the mobile menu | `src/layouts/Base.astro` | The security work was only reachable by scrolling to "Track 2" |
| One-line outcome on every security card | `TicketCard.astro`, 4 project frontmatters | A hiring manager skims for the result, not the tool list |
| MITRE ATT&CK chips, linked to attack.mitre.org | `TicketCard.astro`, `[slug].astro`, `content.config.ts` | Technique IDs were absent from the site entirely while the copy claimed ATT&CK mapping |
| Interactive detection trace on SEC-02 | `src/components/DetectionTrace.astro` | Press "Play detection" and the rows light up as each search fires, then the match count updates |
| Command palette (⌘K / Ctrl+K) | `Base.astro` + `global.css` | Type-ahead over every project, section and page. Small, but it is the detail technical reviewers notice |

### Verifying it
```powershell
cd C:\Users\Ojama\Documents\deepseek-harness\default-workspace\github\dickson-portfolio
git diff                 # review before trusting
npm run dev              # then open http://localhost:4321
npm run build            # must pass before you push
```

**I could not run the build on this machine.** Astro's native compiler binary (`@astrojs/compiler-binding-win32-x64-msvc\astro.win32-x64-msvc.node`) is blocked by a Windows Application Control policy: `An Application Control policy has blocked this file.` That is an OS restriction, not a code error. What I did verify: both client scripts type-check clean under `tsc`, and all four modified frontmatters parse as valid YAML. The Astro template layer still needs your `npm run build`.

One data point to confirm: the SEC-02 trace uses an **excerpt of the 99 attempts** your writeup reports, with relative timestamps, so nothing overstates what happened. Read it and adjust if the sequence differs.

---

## Part 2 - Ideas not built, ranked

### 1. Role landing pages: /support, /soc, /sysadmin
**Why it is the single best idea here.** Your homepage currently serves three audiences at once, which is why the hero advice from the audit felt awkward. You already have five tailored resumes. Three landing pages let one URL carry one identity, and each links its own PDF. A SOC recruiter lands on `ojamadickson.xyz/soc`, sees detection work first, and never wades through service-desk framing.

**Steps**
1. Create `src/pages/soc.astro`, `support.astro`, `sysadmin.astro`, each using `Base` with its own `title`, `description` and `path`.
2. Put the shared blocks in `src/components/` (`Hero.astro`, `Snapshot.astro`, `ProjectGrid.astro`) so the three pages stay thin.
3. Filter collections per page: `getCollection("projects", (p) => p.data.track === "security")` for /soc.
4. Add a `resumeBy` field to `profile.ts` mapping each page to a PDF path, and copy the tailored PDFs into `public/resume/`.
5. Link the pages from the footer plus one line under the hero. Do not put three equal buttons in the nav; pick the primary.

### 2. Annotated evidence, not just screenshots
**Why.** Every case study already has one screenshot. An annotated one - number badges over the exact log line, packet, or rule that proves the claim - is the difference between "a lab" and "someone who can show you the evidence". It is also the fastest way to make the site look expensive.

**Steps**
1. Wrap the figure in a positioned container; put the image in it at `width: 100%`.
2. For each callout, add `<span class="callout" style="--x:42%; --y:18%">1</span>` and a numbered caption list beneath.
3. Style callouts as small circles with `position:absolute; left:var(--x); top:var(--y)`. Keep them accessible: the caption list is the real content, the circles are decoration.
4. Do it for SEC-01 and SEC-02 first; those two carry the strongest evidence.

### 3. Interactive lab topology
**Why.** The hybrid AD → Entra Connect → Intune diagram is your best structural asset and it is currently prose plus a static image. Clickable nodes that open a small panel ("DC01: Server 2025, DNS, DHCP, GPO baselines, LAPS") demonstrate systems thinking in ten seconds.

**Steps**
1. Rebuild the diagram as inline SVG with `<g id="dc01">` per node and `tabindex="0"` on each group.
2. Add `data-node` attributes and a details panel below the diagram; on click/focus, swap the panel content from a JSON object in the frontmatter of a `lab` entry or an Astro component.
3. Keep a plain-text fallback list underneath for screen readers and print.

### 4. "Recently shipped" strip from GitHub, at build time
**Why.** It proves you are active without asking anyone to trust a date on a CV. Build-time fetching means zero client cost and no API key for public repos.

**Steps**
1. In `src/lib/github.ts` (it already exists), add `latestCommit(repo)` using `fetch(https://api.github.com/repos/<owner>/<repo>/commits?per_page=1)`.
2. Call it in the frontmatter of the pages that need it; cache by writing a `.cache/github.json` file and only refetching when older than a day.
3. Render as a one-line strip: `SEC-02 · last commit 4 days ago` linking to the commit.

### 5. "How I troubleshoot" method block
**Why.** Tools are commodity; method is not. Four steps with a worked example from a real case reads like a senior engineer's operating manual and is exactly what support and SOC interviewers probe.

**Steps**
1. Write it as four short paragraphs: reproduce, isolate, fix, confirm, with a fifth line on what gets written down afterwards.
2. Anchor each step to a real event from an existing case study, and link the case.
3. Place it directly under the hero on the /support landing page, not on the homepage.

### 6. An explicit AI-usage disclosure block
**Why.** In 2026, "I use AI and here is how I verify it" is a credibility signal, especially for the AI support applications you are targeting. It also pre-empts the silent assumption that candidates hide it.

**Steps**
1. Three columns: what I use AI for, what I never let it do, how I check the output.
2. Link the agent-tooling project as the evidence.
3. Keep it to a short section on the /support page, not the homepage hero.

### 7. Detail polish that reads as professionalism
Cheap, cumulative, and the sort of thing that makes a technical reviewer nod:
- `prefers-reduced-motion` guard around the detection trace animation.
- Visible focus styles on the palette, cards and callouts (test with Tab only).
- A print stylesheet for `/resume` so `Ctrl+P` produces a clean A4 page.
- A 404 page that offers the three landing pages and the resume.
- Per-section OG images so shared links show the right context.
- A "credentials verified" line with Credly links next to the certifications, and a "last updated" date on case studies.

---

## Part 3 - What to avoid

The things that make a portfolio look amateur rather than exceptional:
- Cursor followers, parallax heroes, autoplaying video, animated counters.
- A dark-mode toggle as a feature in itself.
- Lottie animations of "server" icons.
- A contact form that emails nobody. A mailto and a calendar link are better than a form that silently fails.
- Claiming Lighthouse scores you have not measured.

The site's existing restraint is an asset. Every addition above is content or interaction that adds evidence - that is the direction that earns "this is exceptional", not more motion.

---

## Part 4 - Rollout order

1. `npm run build`, then commit and push the changes I made. Deploy the canonical fix first; everything else compounds on it.
2. Add the Vercel redirect so the duplicate host 301s to the custom domain:
   ```json
   { "redirects": [{ "source": "/(.*)", "destination": "https://ojamadickson.xyz/$1", "permanent": true }] }
   ```
   (put it in `vercel.json`, then confirm the Vercel project's primary domain is the custom one)
3. Annotation pass on SEC-01 and SEC-02 (idea 2).
4. Role landing pages (idea 1) - biggest hiring impact.
5. Topology and GitHub strip (ideas 3 and 4).
6. Polish pass (idea 7), measured with axe and a keyboard-only walkthrough.
