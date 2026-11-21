import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#board .square");

  assert.match(await page.title(), /Chess Lab/);
  assert.equal(await page.locator("#board .square").count(), 64);
  assert.match(await page.locator("#turn").innerText(), /White to move/);

  await page.locator('[data-square="e2"]').click();
  await page.locator('[data-square="e4"]').click();
  assert.equal(await page.locator("#moves .move button").count(), 1);
  await page.locator("#moves .move button").first().click();
  assert.equal(await page.locator("#gameState").innerText(), "Review position");
  assert.equal(await page.locator("#livePosition").isVisible(), true);
  assert.equal(await page.locator("#undo").isDisabled(), true);
  await page.locator("#livePosition").click();
  await page.locator("#undo").click();
  assert.equal(await page.locator("#moves .move button").count(), 0);

  await page.locator("#pgnInput").fill('[Event "Browser smoke"]\n\n1. e4 e5 2. Nf3 Nc6');
  await page.locator("#loadPgn").click();
  assert.equal(await page.locator("#moves .move button").count(), 4);
  assert.equal(await page.locator("#moveCount").innerText(), "4 plies");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#downloadPgn").click()
  ]);
  assert.equal(download.suggestedFilename(), "matudi-chess-game.pgn");

  await page.locator("#newGame").click();
  assert.equal(await page.locator("#moves .move button").count(), 0);
  await page.locator('[data-opening="londonC5"]').click();
  assert.equal(await page.locator("#moveCount").innerText(), "8 plies");

  await page.locator("#engineDepth").selectOption("10");
  await page.locator("#analyze").click();
  await page.waitForFunction(
    () => document.querySelector("#engineState")?.textContent.includes("Analysis complete"),
    { timeout: 90000 }
  );
  assert.match(await page.locator("#engineBest").innerText(), /^Best move:/);
  assert.notEqual(await page.locator("#engineScore").innerText(), "—");
  assert.equal(await page.locator("#stopAnalysis").isDisabled(), true);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", error => errors.push(error.message));
  await mobile.goto("http://127.0.0.1:4174/", { waitUntil: "domcontentloaded" });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(overflow, false, "Mobile chess layout should not overflow horizontally");

  assert.deepEqual(errors, [], "Chess Lab should not throw browser errors");
  console.log("Chess Lab browser smoke passed: board, legal move, move review, PGN import/export, opening line, Stockfish/WASM analysis and mobile layout.");
} finally {
  await browser.close();
}
