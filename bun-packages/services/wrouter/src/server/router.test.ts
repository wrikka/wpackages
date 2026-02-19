import { describe, expect, it } from "vitest";
import { ServerRouter } from "./router";
import type { WRouteRecord, RouteHandler } from "../types";
import { Effect } from "effect";

describe("ServerRouter", () => {
	it("creates router with routes", () => {
		const routes: WRouteRecord[] = [
			{ path: "/", file: "/index.ts", name: "index", params: [], methods: ["GET"] },
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const router = new ServerRouter(routes);
		expect(router).toBeDefined();
	});

	it("matches routes", async () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const router = new ServerRouter(routes);
		const request = new Request("http://localhost/users");

		const match = await Effect.runPromise(router.match(request));
		expect(match?.route.path).toBe("/users");
	});

	it("handles GET requests", async () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const router = new ServerRouter(routes);
		const handler: RouteHandler = () => Effect.succeed(new Response("Users", { status: 200 }));

		await Effect.runPromise(router.addRoute("/users", { GET: handler }));

		const request = new Request("http://localhost/users");
		const response = await Effect.runPromise(router.handle(request));

		expect(response.status).toBe(200);
		expect(await response.text()).toBe("Users");
	});

	it("handles POST requests", async () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["POST"] },
		];

		const router = new ServerRouter(routes);
		const handler: RouteHandler = () => Effect.succeed(new Response("Created", { status: 201 }));

		await Effect.runPromise(router.addRoute("/users", { POST: handler }));

		const request = new Request("http://localhost/users", { method: "POST" });
		const response = await Effect.runPromise(router.handle(request));

		expect(response.status).toBe(201);
	});

	it("returns 404 for unmatched routes", async () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const router = new ServerRouter(routes);
		const request = new Request("http://localhost/posts");

		const response = await Effect.runPromise(router.handle(request));
		expect(response.status).toBe(404);
	});

	it("returns 405 for unsupported methods", async () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const router = new ServerRouter(routes);
		const handler: RouteHandler = () => Effect.succeed(new Response("OK", { status: 200 }));

		await Effect.runPromise(router.addRoute("/users", { GET: handler }));

		const request = new Request("http://localhost/users", { method: "DELETE" });
		const response = await Effect.runPromise(router.handle(request));

		expect(response.status).toBe(405);
	});

	it("passes params to handlers", async () => {
		const routes: WRouteRecord[] = [
			{ path: "/users/[id]", file: "/users/[id].ts", name: "users-id", params: [{ name: "id", type: "string", optional: false }], methods: ["GET"] },
		];

		const router = new ServerRouter(routes);
		const handler: RouteHandler = (_request, params) =>
			Effect.succeed(new Response(JSON.stringify(params), { status: 200 }));

		await Effect.runPromise(router.addRoute("/users/[id]", { GET: handler }));

		const request = new Request("http://localhost/users/123");
		const response = await Effect.runPromise(router.handle(request));

		expect(await response.json()).toEqual({ id: "123" });
	});
});
