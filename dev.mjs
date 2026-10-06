// Local dev server: serves the folder and routes /api/<name> to the same handler Vercel runs.
// run: node dev.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.dirname(new URL(import.meta.url).pathname);
const PORT = 8788;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json" };

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  res.setHeader("Cache-Control", "no-store");

  if (u.pathname.startsWith("/api/")) {
    let payload = "";
    for await (const chunk of req) payload += chunk;
    try { req.body = payload ? JSON.parse(payload) : {}; } catch { req.body = {}; }
    const mod = await import(pathToFileURL(path.join(root, u.pathname + ".js")).href + "?t=" + Date.now());
    const fake = {
      status(c) { res.statusCode = c; return this; },
      setHeader(k, v) { res.setHeader(k, v); return this; },
      json(o) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return this; }
    };
    return mod.default(req, fake);
  }

  const file = u.pathname === "/" ? "/index.html" : u.pathname;
  const p = path.join(root, file);
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.statusCode = 404; return res.end("not found");
  }
  res.setHeader("Content-Type", MIME[path.extname(p)] || "application/octet-stream");
  return fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log("dev on http://localhost:" + PORT));
