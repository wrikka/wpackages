import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { createMockRequest, mockParams } from "./testing";
import { HttpRoutingConfig, HttpRoutingConfigLive, ResponseFactory, ResponseFactoryLive, type RouteDefinition } from "./index";

describe("HttpServer", () => {
	describe("Routing", () => {
		it("should match simple routes", async () => {
			const routes: Record<string, RouteDefinition> = {
				home: {
					method: "GET",
					path: "/",
					handler: () => Effect.succeed({ message: "Hello World" }),
				},
			};

			const routingLayer = HttpRoutingConfigLive(routes);
			const program = Effect.gen(function* () {
				const routing = yield* HttpRoutingConfig;
				const request = createMockRequest({ method: "GET", url: "http://localhost:3000/" });
				const result = yield* routing.match(request);
				return result;
			}).pipe(Effect.provide(routingLayer));

			const result = await Effect.runPromise(program);

			expect(result).toBeDefined();
			expect(result.route.path).toBe("/");
		});

		it("should match routes with path parameters", async () => {
			const routes: Record<string, RouteDefinition> = {
				user: {
					method: "GET",
					path: "/users/:id",
					handler: (_req, params) => Effect.succeed({ userId: params.id }),
				},
			};

			const routingLayer = HttpRoutingConfigLive(routes);
			const program = Effect.gen(function* () {
				const routing = yield* HttpRoutingConfig;
				const request = createMockRequest({ method: "GET", url: "http://localhost:3000/users/123" });
				const result = yield* routing.match(request);
				return result;
			}).pipe(Effect.provide(routingLayer));

			const result = await Effect.runPromise(program);

			expect(result).toBeDefined();
			expect(result.params.id).toBe("123");
		});

		it("should return RouteNotFoundError for non-existent routes", async () => {
			const routes: Record<string, RouteDefinition> = {
				home: {
					method: "GET",
					path: "/",
					handler: () => Effect.succeed({ message: "Hello World" }),
				},
			};

			const routingLayer = HttpRoutingConfigLive(routes);
			const program = Effect.gen(function* () {
				const routing = yield* HttpRoutingConfig;
				const request = createMockRequest({ method: "GET", url: "http://localhost:3000/nonexistent" });
				return yield* routing.match(request);
			}).pipe(Effect.provide(routingLayer));

			const result = await Effect.runPromise(program.pipe(Effect.either));

			expect(result._tag).toBe("Left");
		});
	});

	describe("Response Factory", () => {
		it("should create JSON response", async () => {
			const responseLayer = ResponseFactoryLive();
			const program = Effect.gen(function* () {
				const factory = yield* ResponseFactory;
				return yield* factory.createJsonResponse({ message: "Test" });
			}).pipe(Effect.provide(responseLayer));

			const response = await Effect.runPromise(program);

			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toBe("application/json");
		});

		it("should create error response", async () => {
			const responseLayer = ResponseFactoryLive();
			const program = Effect.gen(function* () {
				const factory = yield* ResponseFactory;
				const error = new Error("Test error");
				return yield* factory.createErrorResponse(error);
			}).pipe(Effect.provide(responseLayer));

			const response = await Effect.runPromise(program);

			expect(response.status).toBe(500);
			expect(response.headers.get("Content-Type")).toBe("application/json");
		});

		it("should add security headers when enabled", async () => {
			const responseLayer = ResponseFactoryLive({ withSecurityHeaders: true });
			const program = Effect.gen(function* () {
				const factory = yield* ResponseFactory;
				return yield* factory.createJsonResponse({ message: "Test" });
			}).pipe(Effect.provide(responseLayer));

			const response = await Effect.runPromise(program);

			expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
			expect(response.headers.get("X-Frame-Options")).toBe("DENY");
		});
	});

	describe("Mock Request", () => {
		it("should create mock request with JSON body", () => {
			const request = createMockRequest({
				method: "POST",
				url: "http://localhost:3000/api/users",
				body: { name: "John" },
			});

			expect(request.method).toBe("POST");
			expect(request.url).toBe("http://localhost:3000/api/users");
			expect(request.headers.get("Content-Type")).toBe("application/json");
		});

		it("should create mock request without body", () => {
			const request = createMockRequest({
				method: "GET",
				url: "http://localhost:3000/api/users",
			});

			expect(request.method).toBe("GET");
			expect(request.body).toBeNull();
		});
	});

	describe("Mock Params", () => {
		it("should create mock route params", () => {
			const params = mockParams({ id: "123", name: "test" });

			expect(params.id).toBe("123");
			expect(params.name).toBe("test");
		});
	});
});
