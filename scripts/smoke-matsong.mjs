import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const html = await readFile("projects/matsong/index.html");
const server = createServer((req, res) => {
  const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
  if (pathname === "/seed") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!doctype html><html><body>seed</body></html>");
    return;
  }
  if (pathname === "/" || pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});
await new Promise(resolve => server.listen(4177, "127.0.0.1", resolve));
const base = "http://127.0.0.1:4177";

function makeWav(seconds = 12, sampleRate = 8000) {
  const samples = seconds * sampleRate;
  const dataBytes = samples * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples; i++) {
    const value = Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 1200);
    buffer.writeInt16LE(value, 44 + i * 2);
  }
  return buffer;
}

const browser = await chromium.launch({ headless: true });
const failures = [];
const localPageErrors = [];
const spotifyPageErrors = [];
const results = [];
const record = (name) => results.push(name);

try {
  const localContext = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await localContext.newPage();
  page.on("pageerror", e => localPageErrors.push(e.message));
  await page.route("https://fonts.googleapis.com/**", route => route.abort());
  await page.route("https://fonts.gstatic.com/**", route => route.abort());
  await page.route("https://open.spotify.com/embed/**", route => route.abort());

  // Seed the v1 database used by the previous production Crimson Edition.
  await page.goto(base + "/seed");
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open("matsong-crimson-db", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("tracks", { keyPath: "id" });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("tracks", "readwrite");
        tx.objectStore("tracks").put({
          id: "legacy-track",
          title: "Legacy Library Track",
          artist: "Existing MATSONG User",
          duration: 42,
          added: Date.now() - 1000,
          favorite: false,
          blob: new Blob(["legacy-audio-placeholder"], { type: "audio/wav" })
        });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelectorAll("#libraryList .track").length === 1);
  assert.match(await page.locator("#libraryList").innerText(), /Legacy Library Track/);
  const dbVersion = await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open("matsong-crimson-db");
    request.onsuccess = () => { const v = request.result.version; const stores = [...request.result.objectStoreNames]; request.result.close(); resolve({ version: v, stores }); };
    request.onerror = () => reject(request.error);
  }));
  assert.equal(dbVersion.version, 2, "existing Crimson DB should be upgraded in place");
  assert.ok(dbVersion.stores.includes("playlists"), "upgrade should add the playlists store");
  record("existing IndexedDB library migrated in place");

  await page.locator("#fileInput").setInputFiles({
    name: "MATSONG Test Clip.wav",
    mimeType: "audio/wav",
    buffer: makeWav()
  });
  await page.waitForFunction(() => document.querySelectorAll("#libraryList .track").length === 2);
  await page.waitForFunction(() => document.querySelectorAll("#localList .track").length === 2);
  assert.match(await page.locator("#libraryList").innerText(), /MATSONG Test Clip/);
  record("short local WAV import accepted and stored");

  await page.locator('[data-view="library"]').click();
  await page.locator("#libraryList .track").filter({ hasText: "MATSONG Test Clip" }).click();
  await page.waitForFunction(() => document.querySelector("#nowTitle")?.textContent === "MATSONG Test Clip");
  await page.waitForFunction(() => {
    const audio = document.querySelector("#audio");
    return audio && audio.src.startsWith("blob:") && !audio.paused;
  });
  record("local audio playback starts from the library");

  await page.locator("#nowLike").click();
  await page.locator('[data-view="favorites"]').click();
  await page.waitForFunction(() => document.querySelectorAll("#favoriteList .track").length === 1);
  assert.match(await page.locator("#favoriteList").innerText(), /MATSONG Test Clip/);
  record("local favorites persist and render");

  await page.locator('[data-view="playlists"]').click();
  await page.locator("#playlistName").fill("Crimson Test Set");
  await page.locator("#playlistForm").evaluate(form => form.requestSubmit());
  await page.waitForFunction(() => document.querySelectorAll("#playlistGrid .mood").length === 1);
  await page.locator('[data-view="library"]').click();
  await page.locator("#libraryList .track").filter({ hasText: "MATSONG Test Clip" }).locator(".add-playlist").click();
  await page.waitForFunction(() => document.querySelector("#toast")?.textContent.includes("Added to Crimson Test Set"));
  await page.locator('[data-view="playlists"]').click();
  await page.locator("#playlistGrid .mood").first().click();
  await page.waitForFunction(() => document.querySelectorAll("#playlistTracks .track").length === 1);
  assert.match(await page.locator("#playlistTracks").innerText(), /MATSONG Test Clip/);
  record("playlist creation and track assignment work");

  await page.locator('[data-view="search"]').click();
  await page.locator("#embedUrl").fill("https://attacker.example/track/1234567890123456789012");
  await page.locator("#embedForm").evaluate(form => form.requestSubmit());
  await page.waitForFunction(() => document.querySelector("#toast")?.textContent.includes("Use an open.spotify.com link"));
  await page.locator("#embedUrl").fill("https://open.spotify.com/intl-en/track/1234567890123456789012?si=test");
  await page.locator("#embedForm").evaluate(form => form.requestSubmit());
  await page.waitForFunction(() => document.querySelector("#embedFrame")?.classList.contains("show"));
  assert.equal(await page.locator("#embedFrame").getAttribute("src"), "https://open.spotify.com/embed/track/1234567890123456789012");
  record("Spotify embed rejects foreign hosts and accepts official localized links");

  await page.locator("#themeBtn").click();
  assert.equal(await page.evaluate(() => localStorage.getItem("matsong-crimson-theme")), "light");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelectorAll("#libraryList .track").length === 2);
  await page.locator('[data-view="playlists"]').click();
  await page.waitForFunction(() => document.querySelectorAll("#playlistGrid .mood").length === 1);
  await page.locator('[data-view="favorites"]').click();
  await page.waitForFunction(() => document.querySelectorAll("#favoriteList .track").length === 1);
  assert.equal(await page.evaluate(() => localStorage.getItem("matsong-crimson-theme")), "light");
  record("library, playlist, favorite and theme survive reload");

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false, "390px mobile layout must not overflow horizontally");
  assert.deepEqual(localPageErrors, [], "local UI should have no uncaught JavaScript errors");
  record("390px mobile layout and local UI runtime clean");

  // OAuth, token refresh, search and Premium playback are tested with mocked Spotify services.
  const spotifyContext = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const spotifyPage = await spotifyContext.newPage();
  spotifyPage.on("pageerror", e => spotifyPageErrors.push(e.message));
  const tokenGrants = [];
  const tokenPayloads = [];
  const apiCalls = [];
  let firstSearch = true;
  await spotifyPage.addInitScript(() => {
    sessionStorage.setItem("matsong_spotify_state", "test-state");
    sessionStorage.setItem("matsong_spotify_verifier", "test-verifier");
  });
  await spotifyPage.route("https://fonts.googleapis.com/**", route => route.abort());
  await spotifyPage.route("https://fonts.gstatic.com/**", route => route.abort());
  await spotifyPage.route("https://images.example/**", route => route.abort());
  await spotifyPage.route("https://accounts.spotify.com/api/token", async route => {
    const params = new URLSearchParams(route.request().postData() || "");
    const grant = params.get("grant_type");
    tokenGrants.push(grant);
    tokenPayloads.push(params);
    const refresh = grant === "refresh_token";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: refresh ? "mock-access-token-2" : "mock-access-token-1",
        refresh_token: refresh ? "mock-refresh-token-2" : "mock-refresh-token-1",
        expires_in: 3600,
        token_type: "Bearer"
      })
    });
  });
  const sdkStub = `
window.Spotify = { Player: class {
  constructor(options) { this.options = options; this.listeners = {}; window.__matsongMockPlayer = this; }
  addListener(name, callback) { this.listeners[name] = callback; return true; }
  connect() { setTimeout(() => this.listeners.ready && this.listeners.ready({ device_id: "matsong-test-device" }), 5); return Promise.resolve(true); }
  activateElement() { return Promise.resolve(); }
  disconnect() { return Promise.resolve(true); }
  pause() { return Promise.resolve(); }
  togglePlay() { return Promise.resolve(); }
  nextTrack() { return Promise.resolve(); }
  previousTrack() { return Promise.resolve(); }
  setVolume() { return Promise.resolve(); }
  setShuffle() { return Promise.resolve(); }
  setRepeat() { return Promise.resolve(); }
  seek() { return Promise.resolve(); }
} };
if (window.onSpotifyWebPlaybackSDKReady) window.onSpotifyWebPlaybackSDKReady();
`;
  await spotifyPage.route("https://sdk.scdn.co/spotify-player.js", route =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: sdkStub }));
  await spotifyPage.route("https://api.spotify.com/v1/**", async route => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    apiCalls.push({ path: url.pathname, method });
    if (url.pathname === "/v1/me") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "matudi-test", display_name: "MATUDI Test" }) });
      return;
    }
    if (url.pathname === "/v1/search" && firstSearch) {
      firstSearch = false;
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { message: "expired token" } }) });
      return;
    }
    if (url.pathname === "/v1/search") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ tracks: { items: [{
          id: "1234567890123456789012",
          uri: "spotify:track:1234567890123456789012",
          name: "Test Track",
          duration_ms: 90000,
          is_playable: true,
          artists: [{ name: "Test Artist" }],
          album: { name: "Test Album", images: [{ url: "https://images.example/cover.jpg" }] }
        }] } })
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  await spotifyPage.goto(base + "/?code=mock-code&state=test-state", { waitUntil: "domcontentloaded" });
  await spotifyPage.waitForFunction(() => document.querySelector("#spotifyDisconnect") && !document.querySelector("#spotifyDisconnect").hidden);
  assert.ok(tokenGrants.includes("authorization_code"), "PKCE authorization-code exchange should occur");
  assert.equal(tokenPayloads[0].get("redirect_uri"), "https://mat-studio.vercel.app/projects/matsong/index.html");
  assert.ok(apiCalls.some(x => x.path === "/v1/me"), "profile should load after authorization");
  assert.equal(await spotifyPage.locator("#spotifyStatus").count(), 1);
  record("Spotify PKCE callback and profile session initialize with mocked services");

  await spotifyPage.locator('[data-view="search"]').click();
  await spotifyPage.locator("#query").fill("Billie Eilish");
  await spotifyPage.locator("#searchForm").evaluate(form => form.requestSubmit());
  await spotifyPage.waitForSelector("#searchResults .album");
  assert.ok(tokenGrants.includes("refresh_token"), "401 response should trigger refresh-token grant");
  assert.equal(apiCalls.filter(x => x.path === "/v1/search").length, 2, "search should retry once after token refresh");
  await spotifyPage.locator("#searchResults .album .textbtn").click();
  await spotifyPage.waitForFunction(() => document.querySelector("#nowTitle")?.textContent === "Test Track");
  assert.ok(apiCalls.some(x => x.path === "/v1/me/player/play" && x.method === "PUT"), "full-track playback should call Spotify player endpoint");
  await spotifyPage.locator("#nowLike").click();
  await spotifyPage.locator('[data-view="favorites"]').click();
  await spotifyPage.waitForFunction(() => document.querySelectorAll("#favoriteList .track").length === 1);
  assert.match(await spotifyPage.locator("#favoriteList").innerText(), /Test Track/);
  await spotifyPage.locator("#spotifyDisconnect").click();
  assert.match(await spotifyPage.locator("#spotifyStatus").innerText(), /Disconnected/);
  assert.equal(await spotifyPage.evaluate(() => sessionStorage.getItem("matsong_spotify_refresh")), null);
  assert.deepEqual(spotifyPageErrors, [], "Spotify mocked UI should have no uncaught JavaScript errors");
  record("Spotify catalog search, 401 token refresh, Premium playback request, favorites and disconnect");

  const mismatchContext = await browser.newContext();
  const mismatchPage = await mismatchContext.newPage();
  await mismatchPage.addInitScript(() => {
    sessionStorage.setItem("matsong_spotify_state", "expected-state");
    sessionStorage.setItem("matsong_spotify_verifier", "expected-verifier");
  });
  await mismatchPage.goto(base + "/?code=bad-code&state=wrong-state", { waitUntil: "domcontentloaded" });
  await mismatchPage.waitForFunction(() => document.querySelector("#spotifyStatus")?.textContent.includes("Sign-in verification failed"));
  record("Spotify OAuth state mismatch is rejected before token exchange");

  await mismatchContext.close();
  await spotifyContext.close();
  await localContext.close();
  process.stdout.write("MATSONG browser smoke passed:\n- " + results.join("\n- ") + "\n");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
