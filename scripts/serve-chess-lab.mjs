import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve("projects/chess-lab");
const allowed = new Set(["stockfish-19-lite-single.js", "stockfish-19-lite-single.wasm"]);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm"
};

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;

  if (pathname.startsWith("/engine/")) {
    const name = pathname.split("/").pop();
    if (!allowed.has(name)) {
      res.writeHead(404).end("Not found");
      return;
    }
    try {
      const upstream = await fetch("https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/" + name);
      if (!upstream.ok) {
        res.writeHead(upstream.status).end("Engine CDN returned " + upstream.status);
        return;
      }
      const data = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(200, {
        "Content-Type": name.endsWith(".wasm") ? "application/wasm" : "text/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": data.length
      });
      res.end(data);
    } catch (error) {
      res.writeHead(502).end("Could not fetch Stockfish engine: " + error.message);
    }
    return;
  }

  const relative = decodeURIComponent(pathname === "/" ? "index.html" : pathname.slice(1));
  const file = resolve(root, relative);
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(4174, "127.0.0.1", () => {
  process.stdout.write("Chess Lab smoke server listening on http://127.0.0.1:4174\n");
});
