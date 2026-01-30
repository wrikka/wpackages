import { Effect, Layer } from "effect";
import type { RouteHandler, RouteDefinition, Middleware } from "../types";
import { createResponse, createErrorResponse, parsePathParams } from "../utils";

export class WebServerService extends Effect.Service<WebServerService>()("WebServerService", {
	effect: Effect.sync(() => {
		return {
			handleRequest: (
				routes: ReadonlyArray<RouteDefinition>,
				_middlewares: readonly Middleware[] = [],
			) => (request: Request): Effect.Effect<Response, never> => {
				return Effect.gen(function*() {
					const url = new URL(request.url);
					const pathname = url.pathname;
					const method = request.method;

					// Find matching route
					for (const route of routes) {
						if (route.method !== method) {
							continue;
						}

						const params = parsePathParams(route.path, pathname);
						if (params !== null) {
							try {
								const handler = route.handler as RouteHandler;
								const result = yield* Effect.promise(() => Promise.resolve(handler(request, params)));
								return yield* Effect.succeed(createResponse(result));
							} catch (error) {
								return yield* Effect.succeed(
									createErrorResponse(
										"Internal Server Error",
										500,
										error instanceof Error ? error.message : undefined,
									),
								);
							}
						}
					}

					return yield* Effect.succeed(createErrorResponse("Not Found", 404));
				});
			},
		};
	}),
}) {}

export const WebServerServiceLive = Layer.effect(WebServerService, WebServerService);

