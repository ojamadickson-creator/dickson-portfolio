import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
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
export const HIDDEN_REPOS = new Set(["ojamadickson-creator", "Resume", "My-Resume", "cysa-test", "Comptia-acore1.0", "Comptia-a-b", "SOC-Analyst-Professional-Portfolio"]);

/** Fetched once at build time. The page also refreshes the list in the browser, so new repos appear without a rebuild. */
let reposOnce: Promise<Repo[]> | undefined;
export function getRepos(): Promise<Repo[]> {
  // One request per build, however many pages ask.
  return (reposOnce ??= fetchRepos());
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "dickson-portfolio" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchRepos(): Promise<Repo[]> {
  const headers = ghHeaders();
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

// ---------- Latest commit per repo, cached on disk ----------

export interface Commit {
  sha: string;
  date: string;
  message: string;
  url: string;
}

const CACHE_FILE = ".cache/github.json";
const TTL_MS = 24 * 60 * 60 * 1000;
/** Hard cap on commit requests in one build. Anything over it is served from cache or hidden. */
const MAX_COMMIT_REQUESTS = 4;

type CacheEntry = { fetchedAt: number; commit: Commit | null };
type Cache = Record<string, CacheEntry>;

let cacheOnce: Promise<Cache> | undefined;
const inFlight = new Map<string, Promise<Commit | null>>();
let requests = 0;

function loadCache(): Promise<Cache> {
  return (cacheOnce ??= readFile(CACHE_FILE, "utf8")
    .then((raw) => JSON.parse(raw) as Cache)
    .catch(() => ({}) as Cache));
}

async function saveCache(cache: Cache) {
  try {
    await mkdir(dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn("[github] could not write cache:", err);
  }
}

/** Accepts "repo", "owner/repo" or a github.com URL. */
function repoPath(repo: string): string {
  const path = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  return path.includes("/") ? path : `${profile.githubUser}/${path}`;
}

/** Last commit on the default branch, or null. Network failure falls back to the cache, then to null. */
export function latestCommit(repo: string): Promise<Commit | null> {
  const key = repoPath(repo);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const job = (async () => {
    const cache = await loadCache();
    const cached = cache[key];
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.commit;
    if (requests >= MAX_COMMIT_REQUESTS) return cached?.commit ?? null;
    requests++;
    try {
      const res = await fetch(`https://api.github.com/repos/${key}/commits?per_page=1`, { headers: ghHeaders() });
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const [c] = (await res.json()) as { sha: string; html_url: string; commit: { message: string; committer: { date: string } } }[];
      const commit: Commit | null = c
        ? { sha: c.sha, date: c.commit.committer.date, message: c.commit.message.split("\n")[0], url: c.html_url }
        : null;
      cache[key] = { fetchedAt: Date.now(), commit };
      await saveCache(cache);
      return commit;
    } catch (err) {
      console.warn(`[github] could not fetch latest commit for ${key}:`, err);
      return cached?.commit ?? null;
    }
  })();
  inFlight.set(key, job);
  return job;
}

/** "today", "yesterday" or "n days ago", relative to the build. */
export function daysAgo(iso: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

export interface Shipped {
  id: string;
  code: string;
  track: string;
  commit: Commit;
}

type ProjectLike = { id: string; data: { code: string; track: string; order: number; repo: string } };

let shippedOnce: Promise<Shipped[]> | undefined;
/**
 * The two most recently pushed project repos per track (four commit requests at most),
 * ranked with the repo list the homepage already fetches. Memoised for the whole build.
 */
export function recentlyShipped(projects: ProjectLike[], perTrack = 2): Promise<Shipped[]> {
  return (shippedOnce ??= (async () => {
    const pushed = new Map((await getRepos()).map((r) => [r.html_url.toLowerCase(), r.pushed_at]));
    const cache = await loadCache();
    const rank = (p: ProjectLike) =>
      pushed.get(p.data.repo.toLowerCase()) ?? cache[repoPath(p.data.repo)]?.commit?.date ?? "";
    const picked = [...new Set(projects.map((p) => p.data.track))].flatMap((track) =>
      projects
        .filter((p) => p.data.track === track)
        .sort((a, b) => rank(b).localeCompare(rank(a)) || a.data.order - b.data.order)
        .slice(0, perTrack),
    );
    const rows = await Promise.all(
      picked.map(async (p) => {
        const commit = await latestCommit(p.data.repo);
        return commit ? { id: p.id, code: p.data.code, track: p.data.track, commit } : null;
      }),
    );
    return rows.filter((r): r is Shipped => r !== null).sort((a, b) => b.commit.date.localeCompare(a.commit.date));
  })());
}
