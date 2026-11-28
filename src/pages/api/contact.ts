import type { APIRoute } from "astro";

// Runs on demand on Vercel (the one route that is not prerendered).
export const prerender = false;

const LIMITS = { name: 120, email: 254, company: 160, message: 4000 };
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

// Per-instance burst guard. Not distributed, but it stops a single client hammering the route.
const seen = new Map<string, number[]>();

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

function overLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  seen.set(ip, recent);
  if (seen.size > 5000) seen.clear();
  return recent.length > MAX_PER_WINDOW;
}

async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return true; // keys not configured yet: never lock the form out
  if (!token) return false;

  const params = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") params.set("remoteip", ip);

  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function notifyByEmail(payload: { name: string; email: string; company: string | null; message: string }) {
  const endpoint = process.env.CONTACT_NOTIFY_URL;
  if (process.env.CONTACT_NOTIFY === "off" || !endpoint) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        company: payload.company ?? "—",
        message: payload.message,
        _subject: `Portfolio contact from ${payload.name}`,
        _replyto: payload.email,
        _template: "table",
        _captcha: "false",
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    /* the email copy is a notification, never the record */
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const origin = request.headers.get("origin") ?? "";
  try {
    if (!origin || new URL(origin).host !== host) return json(403, { ok: false, error: "origin" });
  } catch {
    return json(403, { ok: false, error: "origin" });
  }

  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return json(415, { ok: false, error: "content-type" });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: "json" });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const message = String(body.message ?? "").trim();
  const token = String(body.token ?? "");

  if (name.length < 1 || name.length > LIMITS.name) return json(400, { ok: false, error: "name" });
  if (email.length > LIMITS.email || !isEmail(email)) return json(400, { ok: false, error: "email" });
  if (company.length > LIMITS.company) return json(400, { ok: false, error: "company" });
  if (message.length < 10 || message.length > LIMITS.message) return json(400, { ok: false, error: "message" });

  // Honeypot filled: accept silently so a bot believes it worked.
  if (String(body.website ?? "").trim()) return json(200, { ok: true });

  const ip = clientAddress || (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (overLimit(ip)) return json(429, { ok: false, error: "rate" });

  // hCaptcha token, verified against hCaptcha's siteverify. Only skipped while HCAPTCHA_SECRET
  // is unset, so the form keeps working before the keys exist.
  if (!(await verifyCaptcha(token, ip))) return json(400, { ok: false, error: "captcha" });

  const payload = { name, email, company: company || null, message };

  // Keep URL and key as a pair. The Vercel/Supabase integration also exports SUPABASE_URL and
  // SUPABASE_PUBLISHABLE_KEY, but those point at the integration's own database, where this
  // table does not exist — mixing one of each silently fails with 401.
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "https://mxszpcxuucrmgoqsobpf.supabase.co";
  const supabaseKey =
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_PWZ56gXJZkvteEYxwKJsDQ_PeCDGZMc";

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return json(502, { ok: false, error: "storage" });
  } catch {
    return json(502, { ok: false, error: "storage" });
  }

  await notifyByEmail(payload);
  return json(200, { ok: true });
};
