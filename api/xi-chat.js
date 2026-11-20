"use strict";
const crypto = require("crypto");

const COOKIE = "xi_owner_session";
function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim().toLowerCase();
  if (!origin || !host) return false;
  try { const u = new URL(origin); return u.protocol === "https:" && u.host.toLowerCase() === host; }
  catch { return false; }
}
function authenticated(req) {
  const raw = String(req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
  const signingKey = process.env.MATUDI_ENGINE_TOKEN || "";
  if (!raw || !signingKey) return false;
  let token;
  try { token = decodeURIComponent(raw.slice(COOKIE.length + 1)); } catch { return false; }
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const expected = crypto.createHmac("sha256", signingKey).update(parts[0]).digest("base64url");
  const a = Buffer.from(parts[1]), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const p = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return p.sub === "owner" && Number.isInteger(p.exp) && p.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, { error: "Method not allowed." }); }
  if (!sameOrigin(req)) return send(res, 403, { error: "Request origin rejected." });
  if (!authenticated(req)) return send(res, 401, { error: "Owner sign-in required." });
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length || messages.length > 13) return send(res, 400, { error: "Invalid conversation history." });
  const clean = [];
  for (const item of messages) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.text !== "string" || !item.text.trim() || item.text.length > 12000) {
      return send(res, 400, { error: "Invalid message in conversation." });
    }
    clean.push({ role: item.role === "assistant" ? "model" : "user", text: item.text });
  }
  const last = clean.pop();
  if (!last || last.role !== "user") return send(res, 400, { error: "The latest message must be from the user." });
  const engineUrl = (process.env.MATUDI_ENGINE_URL || "").replace(/\/$/, "");
  const engineToken = process.env.MATUDI_ENGINE_TOKEN || "";
  if (!engineUrl || !engineToken) return send(res, 503, { error: "AI Engine bridge is not configured." });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);
  try {
    const upstream = await fetch(engineUrl + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + engineToken },
      body: JSON.stringify({ projectId: "xi", message: last.text, history: clean.slice(-12) }),
      signal: controller.signal
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return send(res, upstream.status, { error: data.error || "AI Engine request failed.", providerStatus: data.providerStatus });
    return send(res, 200, { ok: true, text: data.text, model: data.model, provider: data.provider });
  } catch (error) {
    return send(res, error && error.name === "AbortError" ? 504 : 502, { error: error && error.name === "AbortError" ? "AI Engine timed out." : "Could not reach AI Engine." });
  } finally { clearTimeout(timeout); }
};
