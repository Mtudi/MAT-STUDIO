"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const api = {
  "/api/xi-auth": require("./api/xi-auth"),
  "/api/xi-chat": require("./api/xi-chat")
};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw Object.assign(new Error("Request body too large."), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { status: 400 });
  }
}

async function handle(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { return json(res, 400, { error: "Invalid request path." }); }

  if (pathname === "/healthz") return json(res, 200, { ok: true, service: "mat-studio" });

  const handler = api[pathname];
  if (handler) {
    try {
      if (req.method === "POST") req.body = await readBody(req);
      else req.body = {};
      return await handler(req, res);
    } catch (error) {
      return json(res, error.status || 500, { error: error.status ? error.message : "Internal server error." });
    }
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return json(res, 405, { error: "Method not allowed." });
  }

  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) return json(res, 403, { error: "Forbidden." });

  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return json(res, 404, { error: "Not found." });
    const headers = {
      "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": path.extname(file) === ".html" ? "no-store" : "public, max-age=3600"
    };
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

const port = Number(process.env.PORT) || 3000;
http.createServer((req, res) => {
  handle(req, res).catch(() => {
    if (!res.headersSent) json(res, 500, { error: "Internal server error." });
    else res.destroy();
  });
}).listen(port, "0.0.0.0", () => {
  process.stdout.write("MAT-STUDIO listening on " + port + "\n");
});
