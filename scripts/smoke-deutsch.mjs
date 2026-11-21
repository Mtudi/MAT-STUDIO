import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#total");

  assert.match(await page.title(), /^MATUDI DEUTSCH/);
  assert.equal(await page.locator("#total").innerText(), "71");

  await page.locator('[data-tab="course"]').click();
  assert.equal(await page.locator("#courseGrid .unit-card").count(), 8);
  await page.locator("#courseGrid .unit-card").first().click();
  assert.match(await page.locator("#unitDetail h3").innerText(), /Greetings & introductions/);

  await page.locator('[data-listen-choice="0"]').click();
  assert.match(await page.locator("#listenFeedback").innerText(), /Richtig/);
  await page.locator('[data-read-choice="0"]').click();
  assert.match(await page.locator("#readFeedback").innerText(), /Richtig/);

  await page.locator("#showModel").click();
  assert.equal(await page.locator("#modelAnswer").isVisible(), true);

  await page.locator("#studyUnitWords").click();
  assert.match(await page.locator("#activeDeckLabel").innerText(), /Unit 1/);
  assert.equal(await page.locator("#cardCount").innerText(), "Card 1 / 13");
  await page.locator("#reveal").click();
  assert.equal(await page.locator("#translation").innerText(), "Hello");
  assert.equal(await page.locator("#translationAr").innerText(), "مرحباً");
  await page.locator("#allWords").click();
  assert.equal(await page.locator("#cardCount").innerText(), "Card 1 / 71");

  await page.locator('[data-tab="home"]').click();
  for (const task of await page.locator("[data-task]").all()) await task.check();
  assert.equal(await page.locator("#completeSession").isEnabled(), true);
  await page.locator("#completeSession").click();
  assert.equal(await page.locator("#sessions").innerText(), "1");
  assert.equal(await page.locator("#streak").innerText(), "1");

  await page.reload({ waitUntil: "domcontentloaded" });
  assert.equal(await page.locator("#sessions").innerText(), "1");
  assert.equal(await page.locator("#streak").innerText(), "1");
  assert.equal(await page.locator("#completeSession").isDisabled(), true);

  await page.locator('[data-tab="library"]').click();
  await page.locator("#librarySearch").fill("Haus");
  assert.equal(await page.locator("#deckGrid .deck-item").count(), 1);
  assert.match(await page.locator("#deckGrid").innerText(), /das Haus/);

  await page.locator('[data-tab="home"]').click();
  await page.locator("#startDue").click();
  assert.equal(await page.locator("#cardCount").innerText(), "Review 1 / 71");
  await page.locator("#reveal").click();
  await page.locator('[data-rate="good"]').click();
  assert.equal(await page.locator("#cardCount").innerText(), "Review 2 / 71");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", error => errors.push(error.message));
  await mobile.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  await mobile.locator('[data-tab="course"]').click();
  await mobile.locator("#courseGrid .unit-card").first().click();
  const horizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(horizontalOverflow, false, "Mobile layout should not overflow horizontally");

  assert.deepEqual(errors, [], "The page should not throw browser errors");
  console.log("Deutsch browser smoke passed: course, skills, vocabulary, spaced review, session persistence and mobile layout.");
} finally {
  await browser.close();
}
