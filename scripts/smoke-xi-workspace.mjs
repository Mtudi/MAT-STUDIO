import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const html = await readFile(resolve("projects/ai-workspace/index.html"));
const server = createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(html);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});
await new Promise(resolveListen => server.listen(4175, "127.0.0.1", resolveListen));

const supabaseStub = `
window.supabase = {
  createClient: function () {
    let session = null;
    return {
      auth: {
        getSession: async function () { return { data: { session }, error: null }; },
        signInAnonymously: async function () {
          const user = { id: "playwright-guest", is_anonymous: true };
          session = { user, access_token: "mock-anonymous-jwt-token-123456" };
          return { data: { user, session }, error: null };
        },
        onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
        signOut: async function () { session = null; return { error: null }; }
      },
      from: function () {
        const chain = {
          select: function () { return chain; },
          order: function () { return chain; },
          limit: function () { return chain; },
          eq: function () { return chain; },
          upsert: async function () { return { error: null }; },
          insert: async function () { return { error: null }; },
          delete: function () { return chain; }
        };
        return chain;
      }
    };
  }
};
`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const pageErrors = [];
const chatRequests = [];
page.on("pageerror", error => pageErrors.push(error.message));

try {
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2**", route =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: supabaseStub }));
  await page.route("https://unpkg.com/@supabase/supabase-js@2**", route =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: supabaseStub }));
  await page.route("**/api/supabase-config", route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "https://mock.supabase.co", publishableKey: "sb_publishable_test" }) }));
  await page.route("**/api/chat", async route => {
    const body = JSON.parse(route.request().postData() || "{}");
    chatRequests.push(body);
    await route.fulfill({
      status: 200,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      body: 'data: {"token":"Hello from Xi"}\n\ndata: {"done":true,"model":"openrouter/free"}\n\n'
    });
  });
  await page.route("https://fonts.googleapis.com/**", route => route.abort());
  await page.route("https://fonts.gstatic.com/**", route => route.abort());

  await page.goto("http://127.0.0.1:4175/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".welcome");
  await page.waitForFunction(() => (document.querySelector("#syncStatus")?.textContent || "").includes("Ready"));
  assert.equal(await page.locator(".chips .chip").count(), 4, "welcome should show four starter prompts");
  assert.match(await page.locator(".welcome-actions").innerText(), /Continue as Guest/);

  await page.locator(".welcome-actions .btn.primary").click();
  await page.waitForFunction(() => (document.querySelector("#syncStatus")?.textContent || "").includes("Guest session active"));
  await page.locator("#input").fill("Hello Xi test");
  await page.locator("#send").click();
  await page.waitForFunction(() => [...document.querySelectorAll(".msg.ai .content")].some(x => x.textContent.includes("Hello from Xi")));
  assert.equal(chatRequests.length, 1, "one chat request should be sent");
  assert.equal(chatRequests[0].guestToken, "mock-anonymous-jwt-token-123456");
  assert.equal(chatRequests[0].accessCode, undefined, "guest chat must not send an owner access code");
  assert.match(await page.locator(".msg.user .content").last().innerText(), /Hello Xi test/);
  assert.match(await page.locator(".msg.ai .content").last().innerText(), /Hello from Xi/);

  await page.locator("#search").fill("Hello Xi test");
  await page.waitForFunction(() => document.querySelectorAll("#list .item").length === 1);
  assert.match(await page.locator("#list .item").first().innerText(), /Hello Xi test/);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".msg.user .content");
  assert.match(await page.locator(".msg.user .content").last().innerText(), /Hello Xi test/, "local conversation should survive a reload");

  await page.locator("#openSettings").click();
  await page.locator("#lang").selectOption("ar");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.locator("#theme").selectOption("light");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.locator("#lang").selectOption("en");
  await page.locator("#closeSettings").click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#menu").click();
  await page.waitForFunction(() => document.querySelector("#app").classList.contains("nav-open"));
  await page.locator("#scrim").click({ force: true });
  await page.waitForFunction(() => !document.querySelector("#app").classList.contains("nav-open"));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, "mobile layout should not overflow horizontally");
  assert.deepEqual(pageErrors, [], "page should have no uncaught JavaScript errors");

  process.stdout.write("Xi Workspace browser smoke passed: guest auth mock, streamed chat mock, local persistence, search, Arabic RTL, theme, mobile drawer and no horizontal overflow.\\n");
} finally {
  await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
