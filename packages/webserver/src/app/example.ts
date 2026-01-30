import { createWebServer } from "../lib";

const app = createWebServer({ port: 3000, host: "localhost" });

// Basic routes without schema validation
app.get("/", () => ({ message: "Hello from WebServer!" }));

app.get("/health", () => ({ status: "ok" }));

// Route with schema validation
app.post("/api/users", async () => {
	// Schema validation will be handled by the router
	return { message: "User created" };
});

// Example with typed schema validation (future enhancement)
// app.post("/api/users", {
//   schema: {
//     body: object({
//       name: string(),
//       email: email(),
//       age: number(),
//     }),
//     response: object({
//       id: number(),
//       name: string(),
//       email: string(),
//     }),
//   },
//   handler: async (request) => {
//     const body = await request.json();
//     return { id: 1, ...body };
//   },
// });

app.start().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
