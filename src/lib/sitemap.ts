import { getCollection } from "astro:content";

export interface SitemapOptions {
  /** Include the blog posts in this sitemap. */
  includeBlog?: boolean;
  /** Include the project case studies in this sitemap. */
  includeProjects?: boolean;
}

/**
 * Builds a <urlset> document. Shared by /sitemap.xml and /sitemap-pages.xml so the
 * two can never drift apart.
 */
export async function buildUrlSet(site: URL | undefined, options: SitemapOptions = {}): Promise<string> {
  const { includeBlog = true, includeProjects = true } = options;
  const base = (site ?? new URL("https://ojamadickson.xyz")).toString().replace(/\/$/, "");

  const [projects, posts] = await Promise.all([
    includeProjects ? getCollection("projects") : Promise.resolve([]),
    includeBlog ? getCollection("blog", ({ data }) => !data.draft) : Promise.resolve([]),
  ]);

  const urls: { loc: string; priority: string; lastmod?: string }[] = [
    { loc: "/", priority: "1.0" },
    { loc: "/about/", priority: "0.9" },
    { loc: "/resume/", priority: "0.9" },
    ...(includeBlog ? [{ loc: "/blog/", priority: "0.8" }] : []),
    ...posts.map((p) => ({
      loc: `/blog/${p.id}/`,
      priority: "0.7",
      lastmod: (p.data.updated ?? p.data.date).toISOString().slice(0, 10),
    })),
    ...projects.map((p) => ({ loc: `/projects/${p.id}/`, priority: "0.8" })),
  ];

  const buildDate = new Date().toISOString().slice(0, 10);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${base}${u.loc}</loc><lastmod>${u.lastmod ?? buildDate}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");
}
