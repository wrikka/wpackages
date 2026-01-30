import { createWebServer } from "../lib";

const app = createWebServer({ port: 3000, host: "localhost" });

// Basic routes
app.get("/", () => ({ message: "Hello from WebServer!" }));

app.get("/health", () => ({ status: "ok" }));

// Route with JSON body
app.post("/api/data", async (request) => {
	const body = await request.json();
	return { received: body };
});

// Start server
app.start().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
