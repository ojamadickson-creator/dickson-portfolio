import type { APIRoute } from "astro";

// TEMPORARY diagnostic: does formsubmit accept this request from Vercel's egress IP?
// Removed immediately after the check. Guarded by a one-off token in the query string.
export const prerender = false;

const TOKEN = "diag-9f3a1c";

export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get("t") !== TOKEN) {
    return new Response("not found", { status: 404 });
  }
  const endpoint = process.env.CONTACT_NOTIFY_URL ?? "https://formsubmit.co/ajax/dickson@ojamadickson.xyz";
  const site = process.env.SITE_URL ?? "https://ojamadickson.xyz";
  const started = Date.now();
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; dickson-portfolio)",
        Origin: site,
        Referer: `${site}/`,
      },
      body: JSON.stringify({
        name: "Server Egress Test",
        email: "test@example.com",
        message: "Diagnostic from the Vercel function: does formsubmit accept this IP?",
        _subject: "Server egress diagnostic",
        _template: "table",
        _captcha: "false",
      }),
    });
    const text = await res.text();
    return new Response(
      JSON.stringify({ status: res.status, ms: Date.now() - started, body: text.slice(0, 400) }),
      { headers: { "content-type": "application/json", "cache-control": "no-store" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error).slice(0, 300), ms: Date.now() - started }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
};
