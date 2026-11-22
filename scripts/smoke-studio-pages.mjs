import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { chromium } from "playwright";

const [christmasHtml, portfolioHtml, hubHtml] = await Promise.all([
  readFile("projects/christmas/index.html"),
  readFile("projects/portfolio/index.html"),
  readFile("showcase/index.html")
]);
const server = createServer((req, res) => {
  const path = new URL(req.url || "/", "http://127.0.0.1").pathname;
  const html = path.startsWith("/christmas") ? christmasHtml : path.startsWith("/portfolio") ? portfolioHtml : path.startsWith("/hub") ? hubHtml : null;
  if (!html) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(html);
});
await new Promise(resolve => server.listen(4178, "127.0.0.1", resolve));
const base = "http://127.0.0.1:4178";
const browser = await chromium.launch({ headless: true });
const results = [];
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, acceptDownloads: true });
  await context.addInitScript(() => {
    try { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async text => { window.__copiedShareUrl = text; }, readText: async () => window.__copiedShareUrl || "" } }); } catch {}
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
  const page = await context.newPage();
  page.on("pageerror", e => pageErrors.push(e.message));

  await page.goto(base + "/christmas", { waitUntil: "domcontentloaded" });
  await page.locator("#recipient").fill("A dear friend");
  await page.locator("#message").fill("أتمنى لك سنة مليئة بالسلام والفرح.\nMay your days be bright.");
  await page.locator("#sender").fill("MATUDI");
  await page.locator('[data-theme="midnight"]').click();
  await page.locator("#saveDraft").click();
  assert.ok(await page.evaluate(() => localStorage.getItem("matudi-christmas-draft-v2")));
  assert.equal(await page.locator("#card").getAttribute("class"), "card midnight");
  assert.equal(await page.locator("#charCount").innerText(), "59 / 260");
  results.push("Christmas Studio saves Unicode drafts locally and applies themes");

  await page.locator("#copyLink").click();
  const shareUrl = await page.evaluate(async () => window.__copiedShareUrl || await navigator.clipboard.readText());
  assert.ok(shareUrl && shareUrl.includes("?card="), "share URL should use a compact card query");
  const sharedPage = await context.newPage();
  sharedPage.on("pageerror", e => pageErrors.push(e.message));
  await sharedPage.goto(shareUrl, { waitUntil: "domcontentloaded" });
  assert.equal(await sharedPage.locator("#editor").evaluate(el => el.classList.contains("hidden")), true);
  assert.equal(await sharedPage.locator("#makeOwn").isVisible(), true);
  assert.equal(await sharedPage.locator("#previewTo").innerText(), "For A dear friend");
  assert.match(await sharedPage.locator("#previewMessage").innerText(), /أتمنى لك سنة مليئة بالسلام والفرح/);
  assert.equal(await sharedPage.locator("#card").getAttribute("class"), "card midnight");
  results.push("Christmas share links preserve Arabic text, recipient and selected theme");

  const [download] = await Promise.all([
    sharedPage.waitForEvent("download"),
    sharedPage.locator("#downloadPng").click()
  ]);
  assert.equal(download.suggestedFilename(), "matudi-christmas-card.png");
  const downloaded = await download.path();
  assert.ok((await stat(downloaded)).size > 10000, "PNG export should contain rendered image data");
  await sharedPage.locator("#makeOwn").click();
  assert.equal(await sharedPage.locator("#editor").evaluate(el => el.classList.contains("hidden")), false);
  assert.equal(new URL(sharedPage.url()).searchParams.has("card"), false);
  results.push("Christmas PNG export downloads a real image and shared view can return to editing");

  const restoredPage = await context.newPage();
  restoredPage.on("pageerror", e => pageErrors.push(e.message));
  await restoredPage.goto(base + "/christmas", { waitUntil: "domcontentloaded" });
  assert.equal(await restoredPage.locator("#recipient").inputValue(), "A dear friend");
  assert.equal(await restoredPage.locator("#sender").inputValue(), "MATUDI");
  assert.equal(await restoredPage.locator("#card").getAttribute("class"), "card midnight");
  await restoredPage.locator("#clearDraft").click();
  assert.equal(await restoredPage.evaluate(() => localStorage.getItem("matudi-christmas-draft-v2")), null);
  await restoredPage.setViewportSize({ width: 390, height: 844 });
  assert.equal(await restoredPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  results.push("Christmas draft restores after reload, clears on request and fits mobile");

  const portfolio = await context.newPage();
  portfolio.on("pageerror", e => pageErrors.push(e.message));
  await portfolio.goto(base + "/portfolio", { waitUntil: "domcontentloaded" });
  assert.equal(await portfolio.locator(".project-card").count(), 6);
  await portfolio.locator('[data-filter="music"]').click();
  assert.equal(await portfolio.locator(".project-card:visible").count(), 1);
  assert.match(await portfolio.locator(".project-card:visible").innerText(), /MATSONG/);
  assert.equal(await portfolio.locator('[data-filter="music"]').getAttribute("aria-pressed"), "true");
  await portfolio.locator('[data-filter="all"]').click();
  assert.equal(await portfolio.locator(".project-card:visible").count(), 6);
  await portfolio.locator("#themeToggle").click();
  assert.equal(await portfolio.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(await portfolio.evaluate(() => localStorage.getItem("matudi-portfolio-theme")), "dark");
  await portfolio.reload({ waitUntil: "domcontentloaded" });
  assert.equal(await portfolio.locator("html").getAttribute("data-theme"), "dark");
  await portfolio.setViewportSize({ width: 390, height: 844 });
  assert.equal(await portfolio.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const hub = await context.newPage();
  hub.on("pageerror", e => pageErrors.push(e.message));
  await hub.goto(base + "/hub", { waitUntil: "domcontentloaded" });
  assert.equal(await hub.locator("#grid .card").count(), 8);
  await hub.locator('[data-filter="music"]').click();
  assert.equal(await hub.locator("#grid .card:visible").count(), 1);
  assert.equal(await hub.locator('[data-filter="music"]').getAttribute("aria-pressed"), "true");
  await hub.locator('[data-filter="all"]').click();
  await hub.locator("#search").fill("Motion Atelier");
  assert.equal(await hub.locator("#grid .card:visible").count(), 1);
  await hub.locator("#search").fill("no-such-project-xyz");
  assert.equal(await hub.locator("#grid .card:visible").count(), 0);
  assert.equal(await hub.locator("#empty").isVisible(), true);
  await hub.locator("#search").fill("");
  assert.equal(await hub.locator("#grid .card:visible").count(), 8);
  const hubLinks = await hub.locator("#grid a").evaluateAll(links => links.map(a => a.href));
  for (const expected of ["https://sharable.link/89k1u749", "https://sharable.link/k2dhaohv", "https://sharable.link/b7sur4cx", "https://sharable.link/d3i3ewiy"]) assert.ok(hubLinks.includes(expected), "Hub should link to " + expected);
  await hub.setViewportSize({ width: 390, height: 844 });
  assert.equal(await hub.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  results.push("Projects Hub category/search filters, empty state, public preview links and mobile layout");

  assert.deepEqual(pageErrors, [], "studio pages should have no uncaught JavaScript errors");
  results.push("Portfolio category filters, theme persistence and 390px responsive layout");

  await context.close();
  process.stdout.write("Studio pages browser smoke passed:\n- " + results.join("\n- ") + "\n");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
