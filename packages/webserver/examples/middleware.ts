import { createWebServer } from "../src/lib";

const app = createWebServer({ port: 3003, host: "localhost" });

app.use(async (request, next) => {
	const start = performance.now();
	const res = await next();
	const ms = performance.now() - start;
	return new Response(res.body, {
		status: res.status,
		headers: {
			...Object.fromEntries(res.headers.entries()),
			"x-response-time": `${ms.toFixed(2)}ms`,
		},
	});
});

app.get("/", () => ({ message: "middleware ok" }));

app.start().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
