"use strict";
const crypto = require("crypto");

const COOKIE = "xi_owner_session";
const SESSION_SECONDS = 8 * 60 * 60;
const attempts = new Map();

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
  try {
    const u = new URL(origin);
    return u.protocol === "https:" && u.host.toLowerCase() === host;
  } catch { return false; }
}
function secret() {
  return process.env.MATUDI_ENGINE_TOKEN || "";
}
function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}
function validSession(req) {
  const raw = String(req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
  if (!raw || !secret()) return false;
  const token = decodeURIComponent(raw.slice(COOKIE.length + 1));
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const expected = sign(parts[0]);
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return payload.sub === "owner" && Number.isInteger(payload.exp) && payload.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
function setCookie(res, value, maxAge) {
  res.setHeader("Set-Cookie", COOKIE + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge);
}
module.exports = async function handler(req, res) {
  if (req.method === "GET") return send(res, 200, { authenticated: validSession(req) });
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return send(res, 405, { error: "Method not allowed." }); }
  if (!sameOrigin(req)) return send(res, 403, { error: "Request origin rejected." });
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (body.action === "logout") {
    setCookie(res, "", 0);
    return send(res, 200, { authenticated: false });
  }
  if (body.action !== "login") return send(res, 400, { error: "Unknown action." });
  const password = typeof body.password === "string" ? body.password : "";
  const expectedPassword = process.env.MAT_STUDIO_CHAT_PASSWORD || "";
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, until: 0 };
  if (entry.until > now) return send(res, 429, { error: "Too many attempts. Try again later." });
  const a = Buffer.from(password);
  const b = Buffer.from(expectedPassword);
  const ok = !!expectedPassword && password.length <= 256 && a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    entry.count += 1;
    if (entry.count >= 6) { entry.count = 0; entry.until = now + 15 * 60 * 1000; }
    attempts.set(ip, entry);
    return send(res, 401, { error: "Incorrect owner password." });
  }
  attempts.delete(ip);
  if (!secret()) return send(res, 503, { error: "Session signing is not configured." });
  const payload = Buffer.from(JSON.stringify({ sub: "owner", iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + SESSION_SECONDS })).toString("base64url");
  setCookie(res, payload + "." + sign(payload), SESSION_SECONDS);
  return send(res, 200, { authenticated: true, expiresIn: SESSION_SECONDS });
};
