import { HttpRouter } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http-server";
import { Effect } from "effect";

export const docsRoute = HttpRouter.get(
	"/docs",
	Effect.gen(function*() {
		const response = yield* ResponseFactory.Current;
		return yield* response.html(`
<!DOCTYPE html>
<html>
<head>
	<title>WebServer API Docs</title>
	<style>
		body { font-family: sans-serif; margin: 2rem; }
		.endpoint { margin: 1rem 0; padding: 0.5rem; border-left: 4px solid #007acc; }
		.method { font-weight: bold; color: #007acc; }
	</style>
</head>
<body>
	<h1>WebServer API Documentation</h1>
	<div class="endpoint">
		<span class="method">GET</span> /healthz - Health check
	</div>
	<div class="endpoint">
		<span class="method">GET</span> /readyz - Readiness check (DB dependent)
	</div>
	<div class="endpoint">
		<span class="method">GET</span> /users/:id - Get user by ID
	</div>
	<div class="endpoint">
		<span class="method">GET</span> /metrics - Metrics endpoint
	</div>
	<div class="endpoint">
		<span class="method">GET</span> /docs - This documentation
	</div>
</body>
</html>
		`);
	}),
);
