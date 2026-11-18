import { profile } from "./profile";

export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

/** Repos hidden from the "latest on GitHub" list (duplicates or old drafts). Edit freely. */
export const HIDDEN_REPOS = new Set(["Resume", "My-Resume", "cysa-test", "Comptia-acore1.0", "Comptia-a-b", "SOC-Analyst-Professional-Portfolio"]);

/** Fetched once at build time. The page also refreshes the list in the browser, so new repos appear without a rebuild. */
export async function getRepos(): Promise<Repo[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "dickson-portfolio" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`, { headers });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const repos = (await res.json()) as Repo[];
    return repos.filter((r) => !r.fork && !r.archived && !HIDDEN_REPOS.has(r.name));
  } catch (err) {
    console.warn("[github] could not fetch repos at build time:", err);
    return [];
  }
}
