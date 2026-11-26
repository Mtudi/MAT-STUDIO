import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

try {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  assert.match(await page.title(), /BUGATTI/i, 'page title should identify the experience');
  assert.equal(await page.locator('.hero h1').count(), 1, 'hero heading should exist');
  const images = page.locator('img');
  const imageCount = await images.count();
  assert.equal(await page.locator('img[alt]').count(), imageCount, 'all images should have alt text');
  const brokenImages = [];
  for (let index = 0; index < imageCount; index++) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    try {
      await image.evaluate(element => element.decode());
    } catch {
      brokenImages.push(await image.getAttribute('src'));
    }
  }
  assert.deepEqual(brokenImages, [], `images failed to decode: ${brokenImages.join(', ')}`);
  await page.evaluate(() => scrollTo(0, 0));

  const menuButton = page.locator('#menuBtn');
  await menuButton.click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true', 'menu should open');
  assert.equal(await page.locator('#menuOverlay').getAttribute('aria-hidden'), 'false', 'open menu should be exposed');
  await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'Escape should close menu');

  await menuButton.click();
  await page.locator('#menuOverlay a[href="#engineering"]').click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'navigation should close menu');

  await page.locator('.swatch[data-color="Glacier Silver"]').click();
  assert.equal(await page.locator('#selectedColor').textContent(), 'Glacier Silver', 'paint selection should update');
  assert.equal(await page.locator('.swatch[data-color="Glacier Silver"]').getAttribute('aria-pressed'), 'true');
  await page.locator('.material[data-material="Deep blue leather"]').click();
  assert.equal(await page.locator('#previewMaterial').textContent(), 'Deep blue leather', 'material selection should update');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(widths.document <= widths.viewport + 1, `mobile layout overflows horizontally: ${JSON.stringify(widths)}`);
  await menuButton.click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true', 'mobile menu should open');
  await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'mobile menu should close with Escape');

  assert.deepEqual(pageErrors, [], `uncaught page errors: ${pageErrors.join('; ')}`);
  console.log('PASS: title, image alt text and decoding, menu navigation, Escape dismissal, configurator controls, mobile overflow, and page errors');
} finally {
  await browser.close();
}
