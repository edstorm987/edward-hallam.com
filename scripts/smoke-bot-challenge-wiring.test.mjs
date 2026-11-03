import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("both Edward Hallam forms declare the exact enquiry action", () => {
  const html = source("public/links/index.html");
  assert.equal((html.match(/data-aqua-challenge-action="brand-enquiry"/g) ?? []).length, 2);
});

test("the static site selects the local or production shared script and blocks early submits", () => {
  const app = source("public/links/app.js");
  assert.match(app, /http:\/\/localhost:3032\/aqua-bot-challenge\.js/);
  assert.match(app, /https:\/\/www\.aqua-crm\.co\.uk\/aqua-bot-challenge\.js/);
  assert.match(app, /document\.addEventListener\('submit',[\s\S]*AquaBotChallenge\?\.ready\(form\)/);
  assert.match(app, /event\.stopImmediatePropagation\(\)/);
});

test("both fetch paths forward and reset single-use proof", () => {
  const app = source("public/links/app.js");
  assert.match(app, /captchaToken,/);
  assert.equal((app.match(/get\('captchaToken'\)/g) ?? []).length, 2);
  assert.match(app, /AquaBotChallenge\?\.reset\(novemForm\)/);
  assert.match(app, /AquaBotChallenge\?\.reset\(contactForm\)/);
  assert.match(app, /brand: 'edward-hallam'/);
});

test("CSP permits only the Aqua script and Turnstile resources needed by this integration", () => {
  const config = source("vercel.json");
  assert.match(config, /script-src 'self' 'unsafe-inline' https:\/\/www\.aqua-crm\.co\.uk https:\/\/challenges\.cloudflare\.com/);
  assert.match(config, /frame-src https:\/\/challenges\.cloudflare\.com/);
});
