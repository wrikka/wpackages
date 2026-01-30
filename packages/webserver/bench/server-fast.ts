// Ultra-fast benchmark server using Bun.serve with raw HTTP response
// Pre-allocated raw response for maximum speed
const HEALTH_RESPONSE = new Response('{"status":"ok"}', {
  status: 200,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

const POST_RESPONSE = new Response('{"ok":true}', {
  status: 200,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

const NOT_FOUND_RESPONSE = new Response('{"error":"Not Found"}', {
  status: 404,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

const server = (Bun as any).serve({
  port: 3000,
  hostname: "localhost",
  fetch(request: Request) {
    const url = request.url;
    const method = request.method;

    // Fast path: health endpoint - return pre-allocated response
    if (url === "http://localhost:3000/health" && method === "GET") {
      return HEALTH_RESPONSE;
    }

    // Fast path: endpoint with path params
    if (url.startsWith("http://localhost:3000/api/data/") && method === "GET") {
      const id = url.slice(31); // "http://localhost:3000/api/data/" = 31 chars
      return new Response(`{"id":"${id}","data":"test"}`, {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Fast path: POST endpoint
    if (url === "http://localhost:3000/api/data" && method === "POST") {
      return POST_RESPONSE;
    }

    return NOT_FOUND_RESPONSE;
  },
});

console.log(`🚀 Ultra-fast server running at http://${server.hostname}:${server.port}`);
