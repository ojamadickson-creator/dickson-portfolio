# Agent handoff: ojamadickson.xyz improvement work

You are working on an existing Astro portfolio for one person (Dickson Ojama, IT support and security labs, Lisbon). Some work is already done and uncommitted; your job is to finish the remaining tasks without breaking what exists.

Read this whole document before touching files.

## 1. Ground rules

- Stack: Astro 7, TypeScript, content collections (src/content/projects/*.md), no UI framework, hand-written CSS with design tokens in src/styles/global.css. Do not add dependencies unless a task says you may.
- The design is restrained on purpose. Tokens: --color-primary, --color-ink, --font-mono, --space-*, --radius-*. Reuse them; do not introduce new colours.
- Content is evidence, not marketing. Never invent metrics, ATT&CK IDs, dates or outcomes. Every number must already exist in the project markdown or be confirmed by the user.
- Voice: first person, plain English, short sentences, no buzzwords (passionate, leveraging, synergy are banned). Do not rewrite existing copy wholesale.
- Surgical diffs. Do not reformat untouched files. Do not rename existing CSS classes.
- Before you finish: npm run build and npx astro check must pass. If the build fails because the native compiler binary is blocked by an OS policy (section 3), stop and report it.

## 2. Repo map

    astro.config.mjs                  site URL and trailingSlash
    src/content.config.ts             Zod schema for the projects collection
    src/content/projects/*.md         one file per case study (8 total: 4 it, 4 security)
    src/layouts/Base.astro            head, nav, mobile menu, footer, command palette
    src/pages/index.astro             homepage (hero, snapshot, project grids, certs, experience, contact)
    src/pages/resume.astro            web version of the resume
    src/pages/projects/[slug].astro   case study template
    src/pages/robots.txt.ts           generated robots.txt (new)
    src/pages/sitemap.xml.ts          generated sitemap (new)
    src/components/TicketCard.astro   project card used on the homepage
    src/components/DetectionTrace.astro  interactive log trace (new)
    src/components/Icon.astro         inline SVG icon set
    src/lib/profile.ts                name, role, links, snapshot facts
    src/lib/github.ts                 GitHub helpers (exists, barely used)
    src/styles/global.css             tokens plus global styles
    public/                           resume PDF, badges, evidence screenshots
    docs/WOW_IDEAS.md                 plan and reasoning behind every task below

## 3. Build caveat (important)

On the machine this work was done, npm run build fails with:

    Error: An Application Control policy has blocked this file.
      node_modules/@astrojs/compiler-binding-win32-x64-msvc/astro.win32-x64-msvc.node

That is a Windows Application Control policy blocking Astro's native compiler binary. It is not a code error. On a normal machine or in CI, npm ci && npm run build should work. If you hit the same message, report it to the user with that exact text rather than patching the toolchain.

## 4. Already implemented (uncommitted) - verify, do not redo

1. astro.config.mjs: site default is now https://ojamadickson.xyz. Every canonical, og:url, og:image and JSON-LD URL derives from Astro.site, so this one line fixed four broken URLs.
2. src/pages/robots.txt.ts and src/pages/sitemap.xml.ts: endpoints, no dependencies.
3. src/layouts/Base.astro: Security link in the desktop nav and the mobile menu; a data-palette-open button; a dialog command palette (Cmd+K / Ctrl+K, arrow keys, Enter, Esc) built at build time from getCollection(projects) plus fixed sections.
4. src/components/Icon.astro: added the search icon.
5. src/content.config.ts: schema gained outcome (max 180 chars), techniques (array of id plus name, id must look like T followed by four digits, optionally a dot and three more), and trace (note plus rows of t/src/event/hit). All optional.
6. src/components/TicketCard.astro: renders outcome as an accent-barred line and techniques as chips linking to attack.mitre.org (dot becomes slash for sub-techniques).
7. src/pages/projects/[slug].astro: outcome panel, technique chips, and the DetectionTrace component when data.trace exists.
8. src/components/DetectionTrace.astro: play and replay sequence, only-matched-rows filter, real table semantics, styling driven by data attributes.
9. Four security markdown files: accurate outcome and techniques; SEC-02 also has an 11-row trace excerpt.
10. src/styles/global.css: palette and kbd styles appended; no existing rules changed.

Run git diff and git status first. If those changes are absent, stop: you have the wrong checkout.

## 5. Tasks

Do them in this order. Each has acceptance criteria; do not move on until they pass.

### T0 - Verify and commit the existing work

    npm ci
    npx astro check
    npm run build
    npm run dev   # open http://localhost:4321

Check: canonical is https://ojamadickson.xyz in view-source; /robots.txt and /sitemap.xml return 200; nav shows Security; a security card shows an outcome line and a T1110 chip; /projects/smb-brute-force/ shows the trace and Play works; Cmd+K opens the palette and typing smb finds the lab.

Then commit: fix: canonical domain, sitemap, ATT&CK chips, detection trace, palette.

### T1 - Role landing pages: /support, /soc, /sysadmin

Goal: one URL per audience, each with its own title, description and resume PDF.

1. Extract reusable homepage blocks into components: Hero.astro, Snapshot.astro, ProjectGrid.astro (props: projects, heading, intro). The homepage must look identical after the refactor.
2. Add a resumes map to src/lib/profile.ts (support, soc, sysadmin) and copy the PDFs into public/resume/. Ask the user which PDF goes where; do not guess.
3. Create src/pages/support.astro, soc.astro and sysadmin.astro, each using Base with its own title, description and path, and filtering the collection per track, for example getCollection(projects, p => p.data.track === security).
4. Content per page: /soc leads with detection work and ATT&CK chips; /support leads with the method block from T5; /sysadmin leads with the topology from T3. Each page ends with its resume download and a contact block.
5. Footer gets one line linking all three. Do not add three equal nav buttons.

Acceptance: three URLs return 200 with unique title and canonical; each downloads its own PDF; no duplicate H1; no layout shift in the hero.

### T2 - Annotated evidence on case studies

Goal: numbered callouts on the screenshot pointing at the exact artefact.

1. New component AnnotatedFigure.astro, props: src, alt, caption, points (x, y as percentages, plus label).
2. Markup: figure, a positioned image wrapper, one absolutely positioned numbered dot per point using the custom properties --x and --y for position, aria-hidden on the dots, and a visible ordered list of labels as the accessible content.
3. Extend the schema with annotations: array of x, y, label (all optional). Render it instead of the plain figure in [slug].astro when present.
4. Apply to SEC-01 and SEC-02 first.

Acceptance: no layout shift; dots stay inside the image at 360px width; captions readable with JS off; nothing overlaps the nav.

### T3 - Interactive lab topology

Goal: clickable AD to Entra Connect to Entra ID and Intune nodes that describe themselves.

1. Inline SVG in a new Topology.astro: one g element per node with data-node, tabindex 0, role button, aria-controls pointing at the panel, and a title child.
2. A sibling panel with aria-live polite; a small script swaps its text from a nodes prop on click, Enter and Space. No framework, no fetch.
3. Render on /sysadmin and link it from the homepage lab paragraph.
4. Provide a plain list of the same facts below the SVG for print and screen readers.

Acceptance: works keyboard-only; panel text changes; visible focus ring; SVG has an accessible name; a fallback list exists.

### T4 - Build-time GitHub recently shipped strip

Goal: prove activity without a CV date.

1. Extend src/lib/github.ts with latestCommit(repo), calling the GitHub commits endpoint with per_page=1, returning sha, date and message, or null on failure.
2. Cache to .cache/github.json with a 24 hour TTL; create the directory if missing; on network failure fall back to the cache, then to null.
3. Render one line under the project grids: code, then last commit in relative days, linking to the commit. Hide the strip when data is null.

Acceptance: build makes no more than four requests; build succeeds offline (cache or hidden strip); no client-side fetch.

### T5 - Method block and AI-usage disclosure on /support

1. Method block: four steps (reproduce, isolate, fix, confirm) plus one line on what gets written down. Anchor each step to a real case study with a link. Place it under the hero on /support only.
2. AI disclosure: three short columns - what I use AI for, what I never let it do, how I check the output. Link the agent-tooling project as evidence. Do not claim AI experience beyond what the case studies state.

Acceptance: no invented facts; both blocks read in the existing voice; no new dependencies.

### T6 - Polish pass

1. prefers-reduced-motion: reduce guard around the detection trace animation and the palette transition. With reduced motion the trace reveals all rows at once instead of stepping.
2. Visible focus-visible styles for palette items, cards, interactive callouts and nav links.
3. Print stylesheet for /resume: A4, hide nav, footer and palette, black text.
4. 404.astro: links to /support, /soc, /sysadmin and the resume.
5. Last updated date under each case study title from an optional ISO date in frontmatter; render nothing when absent.
6. Confirm og:image uses Astro.site, and document in README.md how to set SITE_URL in Vercel for preview deploys.

Acceptance: keyboard-only walkthrough of every page; no focus traps; reduced motion checked in DevTools emulation; print preview does not clip.

## 6. Definition of done

- npx astro check clean and npm run build succeeds.
- Every new page has a unique title, description and canonical.
- No console errors, no layout shift on the hero, images have width and height or an aspect ratio.
- Nothing invented: every metric, technique ID and date traces to existing content or the user.
- The diff is reviewable: no drive-by reformatting, no dependency additions without asking.
- End with a short summary: files changed, what you verified, what you could not verify.

## 7. If you are blocked

- Build blocked by the OS policy in section 3: report it, do not work around it.
- External URLs unavailable: leave the existing link and note it.
- Unsure which resume PDF maps to which page: ask the user; do not guess.
- Tempted to rewrite copy for punchiness: do not. The owner's voice is the product.
