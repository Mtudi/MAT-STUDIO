"use strict";
const assert = require("node:assert/strict");
const handler = require("../api/chat.js");

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

function request({ ip = "198.51.100.10", origin = "https://mat-studio.vercel.app", host = "mat-studio.vercel.app", body = {}, method = "POST" } = {}) {
  return {
    method,
    headers: {
      origin,
      host,
      "x-forwarded-for": ip,
      "content-type": "application/json"
    },
    body
  };
}

function response() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    chunks: [],
    ended: false,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; this.ended = true; return this; },
    write(value) { this.chunks.push(String(value)); return true; },
    end(value) { if (value) this.chunks.push(String(value)); this.ended = true; return this; },
    flushHeaders() {}
  };
}

const baseBody = {
  accessCode: "test-owner-code",
  messages: [{ role: "user", content: "Hello Xi" }]
};
const okProvider = async (url) => {
  if (String(url).includes("openrouter.ai")) {
    return new Response(JSON.stringify({
      model: "test-model",
      choices: [{ message: { content: "Hello from Xi" } }]
    }), { status: 200, headers: { "content-type": "application/json" } });
  }
  throw new Error("Unexpected fetch URL: " + url);
};
async function invoke(req, fetcher = okProvider) {
  global.fetch = fetcher;
  const res = response();
  await handler(req, res);
  return res;
}
function setup() {
  process.env.OPENROUTER_API_KEY = "test-openrouter-key";
  process.env.MAT_STUDIO_CHAT_PASSWORD = "test-owner-code";
  process.env.SUPABASE_URL = "https://mock.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  process.env.MAT_STUDIO_ORIGIN = "https://mat-studio.vercel.app";
}

test("rejects a missing Origin header", async () => {
  setup();
  const res = await invoke(request({ origin: "", body: baseBody }));
  assert.equal(res.statusCode, 403);
});

test("rejects a cross-origin request", async () => {
  setup();
  const res = await invoke(request({ origin: "https://attacker.example", body: baseBody }));
  assert.equal(res.statusCode, 403);
});

test("accepts same-origin Vercel preview requests without opening cross-origin access", async () => {
  setup();
  const host = "mat-studio-git-xi-workspace-release-v2-mat-only.vercel.app";
  const res = await invoke(request({ host, origin: "https://" + host, body: baseBody, ip: "198.51.100.20" }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.answer, "Hello from Xi");
});

test("accepts a valid owner code and returns a server-side provider response", async () => {
  setup();
  const res = await invoke(request({ body: baseBody, ip: "198.51.100.21" }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.answer, "Hello from Xi");
  assert.equal(res.body.model, "test-model");
});

test("limits repeated incorrect owner access-code attempts", async () => {
  setup();
  const ip = "198.51.100.22";
  for (let i = 0; i < 6; i++) {
    const res = await invoke(request({ ip, body: { accessCode: "wrong-code", messages: baseBody.messages } }));
    assert.equal(res.statusCode, 401);
  }
  const blocked = await invoke(request({ ip, body: { accessCode: "wrong-code", messages: baseBody.messages } }));
  assert.equal(blocked.statusCode, 429);
});

test("accepts a verified Supabase anonymous guest token", async () => {
  setup();
  const fetcher = async (url) => {
    if (String(url).includes("/auth/v1/user")) {
      return new Response(JSON.stringify({ id: "anonymous-test-user", is_anonymous: true }), { status: 200 });
    }
    return okProvider(url);
  };
  const res = await invoke(request({
    ip: "198.51.100.23",
    body: { guestToken: "mock-anonymous-jwt-token-123456", messages: baseBody.messages }
  }), fetcher);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.answer, "Hello from Xi");
});

test("rejects a non-anonymous Supabase identity as a guest token", async () => {
  setup();
  const fetcher = async (url) => {
    if (String(url).includes("/auth/v1/user")) {
      return new Response(JSON.stringify({ id: "normal-user", is_anonymous: false }), { status: 200 });
    }
    return okProvider(url);
  };
  const res = await invoke(request({
    ip: "198.51.100.24",
    body: { guestToken: "mock-normal-jwt-token-123456", messages: baseBody.messages }
  }), fetcher);
  assert.equal(res.statusCode, 401);
});

test("rejects malformed message payloads", async () => {
  setup();
  const res = await invoke(request({ ip: "198.51.100.25", body: { accessCode: "test-owner-code", messages: [{ role: "user", content: " " }] } }));
  assert.equal(res.statusCode, 400);
});

test("streams provider tokens as server-sent events", async () => {
  setup();
  const streamFetch = async () => new Response(
    'data: {"model":"test-model","choices":[{"delta":{"content":"Hello "}}]}\n\ndata: {"choices":[{"delta":{"content":"Xi"}}]}\n\ndata: [DONE]\n\n',
    { status: 200, headers: { "content-type": "text/event-stream" } }
  );
  const res = await invoke(request({ ip: "198.51.100.26", body: { ...baseBody, stream: true } }), streamFetch);
  const output = res.chunks.join("");
  assert.equal(res.statusCode, 200);
  assert.match(output, /"token":"Hello "/);
  assert.match(output, /"token":"Xi"/);
  assert.match(output, /"done":true/);
});

test("returns 503 when the server-side provider key is absent", async () => {
  setup();
  process.env.OPENROUTER_API_KEY = "";
  const res = await invoke(request({ ip: "198.51.100.27", body: baseBody }));
  assert.equal(res.statusCode, 503);
});

test("rejects unsupported HTTP methods", async () => {
  setup();
  const res = await invoke(request({ method: "GET", origin: undefined }));
  assert.equal(res.statusCode, 405);
});

(async () => {
  try {
    for (const item of tests) {
      setup();
      await item.fn();
      process.stdout.write("✓ " + item.name + "\n");
    }
    process.stdout.write("\nXi API security tests passed: " + tests.length + "\n");
  } catch (error) {
    process.stderr.write("✗ " + (error && error.message || error) + "\n");
    process.exitCode = 1;
  } finally {
    global.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  }
})();
