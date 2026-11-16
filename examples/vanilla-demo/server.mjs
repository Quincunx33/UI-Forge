import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("./index.html", import.meta.url));
const port = Number(process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("PORT must be an integer between 1024 and 65535.");
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" });
    response.end();
    return;
  }
  if (request.url !== "/" && request.url !== "/index.html") {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "content-length": html.length,
    "cache-control": "no-store"
  });
  response.end(request.method === "HEAD" ? undefined : html);
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`UI-Forge demo: http://127.0.0.1:${port}\nPress Ctrl+C to stop.\n`);
});
