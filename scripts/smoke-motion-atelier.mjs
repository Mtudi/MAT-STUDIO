import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const html = await readFile("Motion Atelier 3D Studio.html");
const server = createServer((req, res) => {
  const path = new URL(req.url || "/", "http://127.0.0.1").pathname;
  if (path !== "/" && path !== "/motion-atelier.html") { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(html);
});
await new Promise(resolve => server.listen(4179, "127.0.0.1", resolve));
const browser = await chromium.launch({
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--disable-dev-shm-usage"]
});
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4179/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForFunction(() => document.querySelectorAll("#cl button").length >= 5, { timeout: 90000 });
  assert.match(await page.locator("#msg").innerText(), /Ready:/);
  assert.equal(await page.locator("#clip-export").isVisible(), true);
  assert.equal(await page.locator("#clip-import").isVisible(), true);

  await page.locator("#tl").focus();
  assert.equal(await page.locator("#pl").getAttribute("aria-pressed"), "true");
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#pl").getAttribute("aria-pressed"), "false");
  await page.keyboard.press("Space");
  assert.equal(await page.locator("#pl").getAttribute("aria-pressed"), "true");

  await page.locator("#new").click();
  await page.locator("#sav").click();
  await page.waitForFunction(() => {
    const saved = JSON.parse(localStorage.getItem("ma.c") || "{}");
    return Object.keys(saved).length === 1;
  });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#clip-export").click()
  ]);
  assert.equal(download.suggestedFilename(), "motion-atelier-clips.json");
  const path = await download.path();
  const exported = JSON.parse(await readFile(path, "utf8"));
  assert.equal(exported.format, "motion-atelier-clip-pack");
  assert.ok(exported.clips.Custom, "new custom clip should be included in the export");
  assert.ok(exported.clips.Custom.tracks && typeof exported.clips.Custom.tracks === "object");
  
  const importPack = {
    format: "motion-atelier-clip-pack",
    version: 1,
    clips: {
      "Imported Wave": { dur: 2, loop: true, custom: true, tracks: { root: [
        { t: 0, v: [0, 0, 0], e: "smooth" },
        { t: 1, v: [0.12, 0, 0], e: "linear" }
      ] } },
      "constructor": { dur: 2, loop: true, custom: true, tracks: { root: [{ t: 0, v: [0, 0, 0], e: "smooth" }] } },
      "Bad Clip": { dur: 2, loop: true, custom: true, tracks: { root: [{ t: 4, v: [0, 0, 0], e: "smooth" }] } }
    }
  };
  await page.locator("#clip-import-file").setInputFiles({
    name: "motion-atelier-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(importPack))
  });
  await page.waitForFunction(() => document.querySelector("#msg")?.textContent.includes("Imported 1 custom clip"));
  assert.match(await page.locator("#msg").innerText(), /2 skipped/);
  assert.ok(await page.locator("#cl").innerText().then(text => text.includes("Imported Wave")));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("ma.c") || "{}"));
  assert.ok(stored["Imported Wave"], "valid imported clip should be saved");
  assert.equal(Object.prototype.hasOwnProperty.call(stored, "constructor"), false, "reserved object property names must be rejected");
  assert.equal(stored["Bad Clip"], undefined, "out-of-range keyframes must be rejected");
  
  await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForFunction(() => document.querySelectorAll("#cl button").length >= 7, { timeout: 90000 });
  assert.ok(await page.locator("#cl").innerText().then(text => text.includes("Imported Wave")));
  assert.ok(await page.locator("#cl").innerText().then(text => text.includes("Custom")));
  
  await page.locator("#ma-ai-launch").click();
  assert.equal(await page.locator("#ma-ai-panel").evaluate(el => getComputedStyle(el).display), "block");
  assert.match(await page.locator("#ma-ai-status").innerText(), /Disconnected/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  const mobileLayout = await page.evaluate(() => {
    const offenders = [...document.querySelectorAll("body *")].map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, id: el.id, className: typeof el.className === "string" ? el.className.slice(0, 60) : "", right: Math.round(r.right), width: Math.round(r.width), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    }).filter(x => x.right > innerWidth + 1 || x.scrollWidth > x.clientWidth + 2).slice(0, 12);
    return { innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, bodyClientWidth: document.body.clientWidth, offenders };
  });
  assert.equal(mobileLayout.documentWidth > mobileLayout.innerWidth, false, "mobile viewport should not overflow horizontally: " + JSON.stringify(mobileLayout));
  assert.deepEqual(errors, [], "Motion Atelier should have no uncaught JavaScript errors");

  await context.close();
  process.stdout.write("Motion Atelier browser smoke passed:\n- WebGL scene and built-in clips initialize\n- Timeline keyboard playback works\n- Custom clips save and export as JSON\n- Import validates names, keyframes and bounds\n- Imported clips persist after reload\n- AI bridge panel opens without auto-connecting\n- Mobile layout has no horizontal overflow\n");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
