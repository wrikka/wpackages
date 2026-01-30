// Hono benchmark server
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/api/data/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id, data: "test" });
});
app.post("/api/data", async (c) => {
  const body = await c.req.json();
  return c.json({ received: body });
});

app.listen({ port: 3000, hostname: "localhost" });

console.log("🚀 Hono server running at http://localhost:3000");
