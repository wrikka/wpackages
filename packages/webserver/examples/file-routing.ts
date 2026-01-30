import { createWebServer } from "../src/lib";

const app = createWebServer({ port: 3001, host: "localhost" });

// File routing example
// Routes are automatically generated from files in the routes/ directory

app.get("/", () => ({ message: "File Routing Example" }));

app.get("/api/users", () => [
	{ id: 1, name: "Alice" },
	{ id: 2, name: "Bob" },
]);

app.get("/api/users/:id", (_request, params) => ({ id: params.id, name: "User" }));

app.post("/api/users", async (request) => {
	const body = await request.json();
	return { id: 3, ...body };
});

// Start server
app.start().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
