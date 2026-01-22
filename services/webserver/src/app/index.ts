import { createWebServer } from "../lib";

export const app = createWebServer({ port: 3000, host: "localhost" });

app.get("/", () => ({ message: "Hello from WebServer!" }));

app.get("/health", () => ({ status: "ok" }));

app.post("/api/data", async (request) => {
	const body = await request.json();
	return { received: body };
});
