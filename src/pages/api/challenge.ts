import type { APIRoute } from "astro";
import { issueChallenge } from "../../lib/challenge";

export const prerender = false;

export const GET: APIRoute = async () => {
  const challenge = await issueChallenge();
  if (!challenge) {
    return new Response(JSON.stringify({ ok: false, error: "unavailable" }), {
      status: 503,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  return new Response(JSON.stringify({ ok: true, ...challenge }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};
