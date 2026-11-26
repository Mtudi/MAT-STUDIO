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
  assert.equal(await page.locator('.brand-mark svg path').count(), 2, 'original Atelier brand seals should render in header and footer');
  assert.equal(await page.locator('.nav-note').textContent(), 'Molsheim · Atelier 01', 'brand descriptor should be present');
  const images = page.locator('img');
  const imageCount = await images.count();
  assert.equal(await page.locator('img[alt]').count(), imageCount, 'all images should have alt text');
  const brokenImages = [];
  for (let index = 0; index < imageCount; index++) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    try {
      await image.evaluate(element => Promise.race([element.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('Image decode timed out')), 7000))]));
    } catch {
      brokenImages.push(await image.getAttribute('src'));
    }
  }
  assert.deepEqual(brokenImages, [], `images failed to decode: ${brokenImages.join(', ')}`);
  await page.locator('#experienceTrack').evaluate(track => track.scrollTo({ left: 0, behavior: 'instant' }));
  await page.waitForTimeout(80);
  await page.locator('#intro').waitFor({ state: 'detached', timeout: 5000 });
  await page.mouse.move(1320, 480);
  await page.waitForFunction(() => document.querySelector('.hero-media img').style.getPropertyValue('--hero-x') !== '', { timeout: 5000 });
  const parallaxX = await page.locator('.hero-media img').evaluate(element => element.style.getPropertyValue('--hero-x'));
  assert.notEqual(parallaxX, '0px', 'desktop pointer should produce subtle hero parallax');

  const track = page.locator('#experienceTrack');
  assert.equal(await track.count(), 1, 'horizontal experience track should exist');
  assert.equal(await page.locator('.scene-panel').count(), 9, 'all eight chapters plus footer should become horizontal scenes');
  assert.equal(await page.locator('#scene-count').textContent(), '01 / 09');
  await page.locator('#sceneNext').click();
  await page.waitForFunction(() => document.querySelector('#scene-count').textContent === '02 / 09');
  await page.locator('.car-card[data-car="chiron"]').click();
  assert.equal(await page.locator('#car-scene').getAttribute('aria-hidden'), 'false', 'car spotlight should open accessibly');
  assert.equal(await page.locator('#carSceneTitle').textContent(), 'Chiron', 'selected car should receive its own scene');
  await page.locator('#carSceneClose').click();
  assert.equal(await page.locator('#car-scene').getAttribute('aria-hidden'), 'true', 'car spotlight should close');
  await page.locator('#soundToggle').click();
  assert.equal(await page.locator('#soundToggle').getAttribute('aria-pressed'), 'true', 'sound must be opt-in');
  await page.locator('#soundToggle').click();

  const menuButton = page.locator('#menuBtn');
  await menuButton.click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true', 'menu should open');
  assert.equal(await page.locator('#menuOverlay').getAttribute('aria-hidden'), 'false', 'open menu should be exposed');
  await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'Escape should close menu');

  await menuButton.click();
  await page.locator('#menuOverlay a[href="#engineering"]').click();
  await page.waitForFunction(() => document.querySelector('#scene-count').textContent === '04 / 09');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'navigation should close menu');

  await page.locator('.swatch[data-color="Glacier Silver"]').click();
  assert.equal(await page.locator('#selectedColor').textContent(), 'Glacier Silver', 'paint selection should update');
  assert.equal(await page.locator('.swatch[data-color="Glacier Silver"]').getAttribute('aria-pressed'), 'true');
  await page.locator('.material[data-material="Deep blue leather"]').click();
  assert.equal(await page.locator('#previewMaterial').textContent(), 'Deep blue leather', 'material selection should update');

  await page.locator('#experienceTrack').evaluate(track => track.scrollTo({ left: innerWidth * 3, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('#scene-count').textContent === '04 / 09');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, track: document.querySelector('#experienceTrack').scrollWidth, trackClient: document.querySelector('#experienceTrack').clientWidth }));
  assert.ok(widths.document <= widths.viewport + 1, `mobile document overflows horizontally: ${JSON.stringify(widths)}`);
  assert.ok(widths.track > widths.trackClient, 'mobile should retain a horizontally navigable scene track');
  await page.locator('#sceneNext').click();
  await page.waitForFunction(() => document.querySelector('#scene-count').textContent === '05 / 09');
  await menuButton.click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true', 'mobile menu should open');
  await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'mobile menu should close with Escape');

  assert.deepEqual(pageErrors, [], `uncaught page errors: ${pageErrors.join('; ')}`);

  const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reducedPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await reducedPage.locator('#intro').waitFor({ state: 'detached', timeout: 5000 });
  await reducedPage.mouse.move(220, 240);
  await reducedPage.waitForTimeout(50);
  const reduced = await reducedPage.evaluate(() => ({
    preference: matchMedia('(prefers-reduced-motion: reduce)').matches,
    heroMotion: document.querySelector('.hero-media img').style.getPropertyValue('--hero-x'),
    titleDuration: getComputedStyle(document.querySelector('.hero-content h1')).animationDuration
  }));
  assert.equal(reduced.preference, true, 'reduced-motion preference should be honored');
  assert.equal(reduced.heroMotion, '', 'pointer parallax should be disabled for reduced motion');
  assert.ok(parseFloat(reduced.titleDuration) <= 0.00001, 'intro animation should be effectively disabled for reduced motion');
  await reducedPage.close();
  console.log('PASS: title, brand identity, all image decoding, horizontal scenes and navigation, car spotlights, opt-in sound, menu navigation, configurator controls, mobile horizontal track, reduced motion, and page errors');
} finally {
  await browser.close();
}
