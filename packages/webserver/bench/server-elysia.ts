// Elysia benchmark server
import { Elysia } from "elysia";

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .get("/api/data/:id", ({ params: { id } }) => ({ id, data: "test" }))
  .post("/api/data", async ({ body }) => ({ received: body }));

app.listen({ port: 3000, hostname: "localhost" });

console.log("🚀 Elysia server running at http://localhost:3000");
