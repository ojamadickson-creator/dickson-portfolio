// End-to-end browser test for the contact form, driven over the Chrome DevTools Protocol.
// Usage: node scripts/e2e-contact.mjs http://localhost:3102/about/
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3102/about/";
const shotPath = process.argv[3] ?? path.join(os.tmpdir(), "contact-e2e.png");
const port = 9223;
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = path.join(os.tmpdir(), `crs-e2e-${Date.now()}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const child = spawn(
  chrome,
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1440,1200", "about:blank"],
  { stdio: "ignore" },
);

async function waitForDevtools() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error("devtools endpoint never came up");
}

let id = 0;
const pending = new Map();
function send(ws, method, params = {}) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
}

try {
  await waitForDevtools();
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })
  ).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };

  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");
  await send(ws, "Page.navigate", { url });
  await sleep(4000);

  const evaluate = async (expression) => {
    const res = await send(ws, "Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text + " " + (res.exceptionDetails.exception?.description ?? ""));
    return res.result.value;
  };

  const result = await evaluate(`(async () => {
    const form = document.getElementById("contact-form");
    if (!form) return { error: "no form on this page" };
    form.scrollIntoView({ block: "center" });
    await new Promise(r => setTimeout(r, 800));

    const set = (el, value) => {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set;
      setter.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const field = (name) => form.elements.namedItem(name);

    set(field("name"), "E2E Test");
    set(field("email"), "e2e@example.com");
    set(field("company"), "Review");
    set(field("message"), "This is an automated check of the contact form. Please ignore.");

    // The signed question arrives from /api/challenge/; solve it like a visitor would.
    const questionEl = form.querySelector("[data-question]");
    let question = "";
    for (let i = 0; i < 40; i++) {
      question = (questionEl.textContent || "").trim();
      if (/What is \\d+ [+×] \\d+\\?/.test(question)) break;
      await new Promise(r => setTimeout(r, 200));
    }
    const m = question.match(/What is (\\d+) ([+×]) (\\d+)\\?/);
    const answer = m ? (m[2] === "+" ? Number(m[1]) + Number(m[3]) : Number(m[1]) * Number(m[3])) : "";
    if (answer !== "") set(field("answer"), String(answer));

    form.requestSubmit();
    await new Promise(r => setTimeout(r, 2500));
    const status = form.querySelector(".form__status");
    return {
      question,
      answered: answer !== "",
      challengeVisible: !form.querySelector(".form__challenge")?.hidden,
      status: status ? status.textContent.trim() : null,
      kind: status ? status.dataset.kind : null,
      fallbackHidden: form.querySelector(".form__fallback")?.hidden ?? null,
    };
  })()`);

  console.log(JSON.stringify(result, null, 2));

  const shot = await send(ws, "Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(shotPath, Buffer.from(shot.data, "base64"));
  console.log("screenshot:", shotPath);
  ws.close();
} finally {
  child.kill();
  await sleep(500);
}
