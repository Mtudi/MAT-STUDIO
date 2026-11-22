import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const html = await readFile("projects/xi/index.html");
const hub = await readFile("showcase/index.html");
const server = createServer((req, res) => {
  const path = new URL(req.url || "/", "http://127.0.0.1").pathname;
  const body = path === "/projects/xi/index.html" ? html : path === "/showcase/index.html" ? hub : path === "/" ? Buffer.from("<title>Xi app route</title>") : null;
  if (!body) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
});
await new Promise(resolve => server.listen(4180, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://127.0.0.1:4180/projects/xi/index.html", { waitUntil: "domcontentloaded" });
  assert.equal(await page.title(), "Xi — Personal AI by MATUDI");
  assert.equal(await page.locator("h1").count(), 1);
  assert.match(await page.locator("h1").innerText(), /Your AI/);
  assert.match(await page.locator(".status").innerText(), /PRIVATE BUILD/);
  assert.match(await page.locator(".live").innerText(), /ILLUSTRATIVE PREVIEW/);
  assert.equal(await page.locator('nav[aria-label="Primary navigation"]').count(), 1);
  assert.equal(await page.locator('a[href="../../"]').first().getAttribute("href"), "../../");
  assert.ok(await page.locator('a[href="../../showcase/index.html"]').count() >= 1);
  assert.equal(await page.locator("script").count(), 0, "public overview should not ship client secrets or runtime keys");
  await page.locator('a[href="#access"]').click().catch(()=>{});
  assert.equal(await page.locator("#access").count(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  process.stdout.write("Xi public landing browser smoke passed:\n- Project overview and private-access status render\n- Owner-app and hub links are present\n- No client-side script or key material is shipped\n- Accessible navigation and 390px mobile layout\n");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
