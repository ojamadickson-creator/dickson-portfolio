/**
 * Signed arithmetic challenge for the contact form.
 *
 * The question is generated on the server and signed with HMAC-SHA256, so the answer
 * cannot be flipped in the browser: the server re-derives the operands from the signed
 * payload and checks the typed answer itself. Tokens expire after ten minutes.
 *
 * This is a speed bump for naive bots, not Turnstile-grade detection: a script that
 * fetches the question can solve it. It sits on top of the origin check, the honeypot
 * and the per-IP rate limit, which is the combination that matters here.
 */

const TTL_MS = 10 * 60 * 1000;
const OPS = ["+", "×"] as const;
type Op = (typeof OPS)[number];

export interface Challenge {
  id: string;
  question: string;
}

interface Payload {
  a: number;
  b: number;
  op: Op;
  exp: number;
}

const encoder = new TextEncoder();

const b64url = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const fromB64url = (value: string) => new Uint8Array(Buffer.from(value, "base64url"));

function secret(): string {
  return process.env.CHALLENGE_SECRET ?? "";
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function answerFor(payload: Payload): number {
  return payload.op === "+" ? payload.a + payload.b : payload.a * payload.b;
}

export async function issueChallenge(): Promise<Challenge | null> {
  if (!secret()) return null;
  const payload: Payload = {
    a: 2 + Math.floor(Math.random() * 8),
    b: 2 + Math.floor(Math.random() * 8),
    op: OPS[Math.floor(Math.random() * OPS.length)],
    exp: Date.now() + TTL_MS,
  };
  const body = b64url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(body));
  return {
    id: `${body}.${b64url(new Uint8Array(signature))}`,
    question: `What is ${payload.a} ${payload.op} ${payload.b}?`,
  };
}

export async function verifyChallenge(id: string, answer: string): Promise<boolean> {
  if (!secret()) return false;
  const [body, signature] = id.split(".");
  if (!body || !signature) return false;

  let ok = false;
  try {
    ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(signature), encoder.encode(body));
  } catch {
    return false;
  }
  if (!ok) return false;

  let payload: Payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Payload;
  } catch {
    return false;
  }
  if (!payload || typeof payload.a !== "number" || typeof payload.b !== "number") return false;
  if (!OPS.includes(payload.op)) return false;
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) return false;

  const expected = String(answerFor(payload));
  return answer.trim() === expected;
}
