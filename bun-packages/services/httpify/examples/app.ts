import { createApp, createRouter, defineEventHandler } from "../src";

// Create an app instance
export const app = createApp();

// Create a new router and register it in app
const router = createRouter();
app.use(router);

// Add routes
router.get("/", defineEventHandler((_event) => {
  return { message: "⚡️ Welcome to httpify!" };
}));

router.get("/hello/:name", defineEventHandler((event) => {
  const name = event.context['params']?.name || "World";
  return { message: `Hello, ${name}!` };
}));

router.post("/api/data", defineEventHandler(async (event) => {
  const body = await event.request.json();
  return { received: body, timestamp: new Date().toISOString() };
}));

// Start server if this file is run directly
if (import.meta.main) {
  const handler = async (req) => {
    const event = {
      request: req,
      response: new Response(),
      context: {},
    };

    const result = await app.handle(event);

    if (typeof result === "string") {
      return new Response(result, {
        status: event.response.status || 200,
        headers: event.response.headers,
      });
    }

    if (result && typeof result === "object") {
      const responseHeaders = event.response.headers || {};
      const resultHeaders = result.headers || {};
      const headers = Object.assign({
        "Content-Type": "application/json",
      }, responseHeaders, resultHeaders);
      return new Response(JSON.stringify(result), {
        status: result.status || event.response.status || 200,
        headers,
      });
    }

    return result || new Response("Not Found", { status: 404 });
  };

  Bun.serve({
    port: 3000,
    fetch: handler,
  });

  console.log("🚀 Server running on http://localhost:3000");
}
