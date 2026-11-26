import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
});
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("http://127.0.0.1:4175/Motion%20Atelier%203D%20Studio.html", {
    waitUntil: "domcontentloaded"
  });
  await page.waitForSelector("#cl button", { timeout: 45000 });
  await page.waitForSelector("#vp canvas", { timeout: 15000 });

  assert.match(await page.title(), /Motion Atelier/);
  assert.equal(await page.locator("#cl button").count(), 5, "Five built-in animation presets should load");
  assert.match(await page.locator("#info").innerText(), /Placeholder rig/);
  assert.equal(await page.locator("#badge").isVisible(), true, "Placeholder warning should be visible");
  assert.ok(await page.locator("#vp canvas").evaluate(canvas => canvas.width > 0 && canvas.height > 0));

  await page.locator("#cl button", { hasText: "Walk" }).click();
  await page.locator("#pl").click();
  assert.equal(await page.locator("#pl").innerText(), "Play");
  await page.locator("#pl").click();
  assert.equal(await page.locator("#pl").innerText(), "Pause");

  await page.locator("#nx").click();
  assert.match(await page.locator("#tm").innerText(), /\/ .*s/);

  await page.locator("#new").click();
  assert.equal(await page.locator("#cl button", { hasText: "Custom" }).count(), 1);
  await page.locator("#ak").click();
  await page.locator("#sav").click();
  assert.match(await page.locator("#msg").innerText(), /Saved 1 custom clip/);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#cl button", { timeout: 45000 });
  assert.equal(await page.locator("#cl button", { hasText: "Custom" }).count(), 1,
    "Saved custom clip should persist after reload");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", error => errors.push(error.message));
  await mobile.goto("http://127.0.0.1:4175/Motion%20Atelier%203D%20Studio.html", {
    waitUntil: "domcontentloaded"
  });
  await mobile.waitForSelector("#cl button", { timeout: 45000 });
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  assert.equal(overflow, false, "Mobile layout should not overflow horizontally");
  assert.ok(await mobile.locator("#vp canvas").evaluate(canvas => canvas.width > 0 && canvas.height > 0));

  assert.deepEqual(errors, [], "Motion Atelier should not throw uncaught browser errors");
  console.log("Motion Atelier browser smoke passed: WebGL canvas, placeholder rig, animation presets, playback, keyframe creation, local persistence and mobile layout.");
} finally {
  await browser.close();
}
