"use strict";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");

let child;
let base;
let output = "";

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

before(async () => {
  const port = await freePort();
  base = "http://127.0.0.1:" + port;
  child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      MATUDI_ENGINE_TOKEN: "test-only-engine-token",
      MAT_STUDIO_CHAT_PASSWORD: "test-only-owner-password",
      MATUDI_ENGINE_URL: ""
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", chunk => { output += chunk.toString(); });
  child.stderr.on("data", chunk => { output += chunk.toString(); });

  let ready = false;
  for (let i = 0; i < 50; i++) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(base + "/healthz");
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, "server failed to start: " + output);
});

after(() => {
  if (child && child.exitCode === null) child.kill("SIGTERM");
});

test("health endpoint returns service status", async () => {
  const response = await fetch(base + "/healthz");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: "mat-studio" });
});

test("root serves the Xi application with safe headers", async () => {
  const response = await fetch(base + "/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(await response.text(), /Xi — Personal AI/);
});

test("known project pages are served from their repository paths", async () => {
  const paths = [
    "/projects/ai-workspace/index.html",
    "/projects/chess-lab/index.html",
    "/projects/matsong/index.html",
    "/projects/deutsch/index.html",
    "/projects/christmas/index.html",
    "/projects/portfolio/index.html",
    "/Motion%20Atelier%203D%20Studio.html"
  ];
  for (const path of paths) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/, path);
  }
});

test("project directory URLs resolve to their index pages", async () => {
  for (const path of ["/projects/xi/", "/projects/matsong/", "/projects/chess-lab/", "/projects/portfolio/"]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/, path);
  }
});

test("HEAD requests return headers without a response body", async () => {
  const response = await fetch(base + "/", { method: "HEAD" });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});

test("encoded traversal attempts cannot escape the project root", async () => {
  const response = await fetch(base + "/..%2Fpackage.json");
  assert.equal(response.status, 403);
});

test("unsupported methods are rejected on static routes", async () => {
  const response = await fetch(base + "/", { method: "POST" });
  assert.equal(response.status, 405);
  assert.match(response.headers.get("allow"), /GET/);
});

test("owner auth reports unauthenticated state before login", async () => {
  const response = await fetch(base + "/api/xi-auth");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { authenticated: false });
});

test("owner login issues a signed HttpOnly session cookie", async () => {
  const response = await fetch(base + "/api/xi-auth", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://localhost:" + new URL(base).port,
      "x-forwarded-host": "localhost:" + new URL(base).port
    },
    body: JSON.stringify({ action: "login", password: "test-only-owner-password" })
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).authenticated, true);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /xi_owner_session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);

  const session = await fetch(base + "/api/xi-auth", { headers: { cookie: cookie.split(";")[0] } });
  assert.equal((await session.json()).authenticated, true);
});

test("chat endpoint rejects requests without an owner session", async () => {
  const response = await fetch(base + "/api/xi-chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://localhost:" + new URL(base).port,
      "x-forwarded-host": "localhost:" + new URL(base).port
    },
    body: JSON.stringify({ messages: [{ role: "user", text: "hello" }] })
  });
  assert.equal(response.status, 401);
});
