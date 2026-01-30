import { createWebServer } from "../src/lib";

const app = createWebServer({ port: 3000, host: "localhost" });

// Pre-allocated response for health endpoint - fastest possible
const HEALTH_RESPONSE = new Response(JSON.stringify({ status: "ok" }), {
  headers: { "Content-Type": "application/json" },
});

app.get("/health", () => HEALTH_RESPONSE);

// Fast path for endpoint with path params - no validation
app.get("/api/data/:id", (_request, params) => {
  const response = new Response(JSON.stringify({ id: params.id, data: "test" }), {
    headers: { "Content-Type": "application/json" },
  });
  return response;
});

// Fast POST endpoint - minimal overhead
app.post("/api/data", async (request) => {
  try {
    const body = await request.json();
    const response = new Response(JSON.stringify({ received: body }), {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch {
    const response = new Response(JSON.stringify({ error: "Failed to parse JSON" }), {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  }
});

app.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
