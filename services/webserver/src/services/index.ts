import { Effect, Layer } from "effect";
import type { RouteParams, RouteHandler, RouteDefinition, Middleware } from "../types";
import { createResponse, createErrorResponse } from "../utils";

export class WebServerService extends Effect.Service<WebServerService>()("WebServerService", {
	effect: Effect.gen(function*() {
		return {
			handleRequest: (
				routes: ReadonlyArray<RouteDefinition>,
				middlewares: readonly Middleware[] = [],
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
								const result = yield* Effect.promise(() => handler(request, params));
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

const parsePathParams = (path: string, pathname: string): RouteParams | null => {
	const pathSegments = path.split("/").filter(Boolean);
	const pathnameSegments = pathname.split("/").filter(Boolean);

	if (pathSegments.length !== pathnameSegments.length) {
		return null;
	}

	const params: RouteParams = {};

	for (let i = 0; i < pathSegments.length; i++) {
		const pathSegment = pathSegments[i];
		const pathnameSegment = pathnameSegments[i];

		if (!pathSegment || !pathnameSegment) {
			return null;
		}

		if (pathSegment.startsWith(":")) {
			params[pathSegment.slice(1)] = pathnameSegment;
		} else if (pathSegment !== pathnameSegment) {
			return null;
		}
	}

	return params;
};

export const WebServerServiceLive = Layer.effect(WebServerService, WebServerService);

export * from "./elysia";
