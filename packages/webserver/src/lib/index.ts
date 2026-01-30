import type { RouteHandler, RouteDefinition, Middleware, RouteWithSchema, RouteParams } from "../types";
import { parsePathParams, createErrorResponse, validateSchema, createValidationErrorResponse } from "../utils";

function isRouteWithSchema(route: RouteDefinition): route is RouteWithSchema & { schema: NonNullable<RouteWithSchema["schema"]> } {
	return "schema" in route && route.schema !== undefined;
}

export class Router {
	private routes: Map<string, RouteDefinition> = new Map();
	private methodRoutes: Map<string, Map<string, RouteDefinition>> = new Map();
	private middlewares: Middleware[] = [];
	private patternRoutes: Map<string, { route: RouteDefinition; pattern: string }[]> = new Map();

	constructor() {
		// Pre-initialize method route maps for faster lookup
		this.methodRoutes.set("GET", new Map());
		this.methodRoutes.set("POST", new Map());
		this.methodRoutes.set("PUT", new Map());
		this.methodRoutes.set("DELETE", new Map());
		this.methodRoutes.set("PATCH", new Map());
	}

	addRoute<R = unknown, E = unknown, A = unknown>(route: RouteDefinition<R, E, A>): this {
		const key = `${route.method}:${route.path}`;
		this.routes.set(key, route);

		// Also add to method-specific map for faster lookup
		const methodMap = this.methodRoutes.get(route.method);
		if (methodMap) {
			methodMap.set(route.path, route);
		}

		// Build pattern cache for faster matching
		if (route.path.includes(":")) {
			const patterns = this.patternRoutes.get(route.method) ?? [];
			patterns.push({ route, pattern: route.path });
			this.patternRoutes.set(route.method, patterns);
		}

		return this;
	}

	use(middleware: Middleware): this {
		this.middlewares.push(middleware);
		return this;
	}

	async handle(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;
		const method = request.method;

		// Fast path: try exact match first
		const methodMap = this.methodRoutes.get(method);
		let matchedRoute: RouteDefinition | null = null;
		let matchedParams: RouteParams | null = null;

		if (methodMap) {
			// Try exact match first
			matchedRoute = methodMap.get(pathname) || null;

			if (matchedRoute) {
				matchedParams = {};
			} else {
				// Try pattern matching using cached patterns
				const patterns = this.patternRoutes.get(method);
				if (patterns) {
					for (const { route, pattern } of patterns) {
						const params = parsePathParams(pattern, pathname);
						if (params !== null) {
							matchedRoute = route;
							matchedParams = params;
							break;
						}
					}
				}
			}
		}

		// Check for method mismatch (405)
		if (matchedRoute === null) {
			// Check if path exists with different method
			for (const [otherMethod, otherMethodMap] of this.methodRoutes.entries()) {
				if (otherMethod === method) continue;

				if (otherMethodMap.has(pathname)) {
					return createErrorResponse("Method Not Allowed", 405);
				}

				// Check pattern matches using cached patterns
				const patterns = this.patternRoutes.get(otherMethod);
				if (patterns) {
					for (const { pattern } of patterns) {
						if (parsePathParams(pattern, pathname) !== null) {
							return createErrorResponse("Method Not Allowed", 405);
						}
					}
				}
			}

			// No route found at all
			return createErrorResponse("Not Found", 404);
		}

		// Fast path: no schema validation, no middlewares
		const hasSchema = isRouteWithSchema(matchedRoute);
		const hasMiddlewares = this.middlewares.length > 0;

		if (!hasSchema && !hasMiddlewares) {
			// Fastest path: direct handler call
			const routeHandler = matchedRoute.handler as RouteHandler;
			const result = await routeHandler(request, matchedParams || {});

			// Allow passthrough for Response objects
			if (result instanceof Response) {
				return result;
			}

			return new Response(JSON.stringify(result), {
				headers: { "Content-Type": "application/json" },
			});
		}

		// Build handler function
		const routeHandler = matchedRoute.handler as RouteHandler;

		const handler = async (): Promise<Response> => {
			// Validate schema if present
			if (isRouteWithSchema(matchedRoute)) {
				const routeWithSchema = matchedRoute;

				// Validate body
				if (routeWithSchema.schema?.body && request.method !== "GET" && request.method !== "HEAD") {
					try {
						const body = await request.json();
						const result = validateSchema(routeWithSchema.schema.body, body, "body");
						if (!result.success) {
							return createValidationErrorResponse(result.error);
						}
					} catch (error) {
						return createErrorResponse(
							"Invalid JSON body",
							400,
							error instanceof Error ? error.message : undefined,
						);
					}
				}

				// Validate query
				if (routeWithSchema.schema?.query) {
					const query: Record<string, string> = {};
					url.searchParams.forEach((value, key) => {
						query[key] = value;
					});
					const result = validateSchema(routeWithSchema.schema.query, query, "query");
					if (!result.success) {
						return createValidationErrorResponse(result.error);
					}
				}
			}

			if (matchedParams === null) {
				return createErrorResponse("Internal Server Error", 500, "Route params not resolved");
			}
			const result = await routeHandler(request, matchedParams);

			// Allow passthrough for Response objects
			if (result instanceof Response) {
				return result;
			}

			// Fast path: use pre-allocated headers for simple objects
			if (typeof result === "object" && result !== null && !Array.isArray(result)) {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json" },
				});
			}

			// Validate response schema if present
			if (isRouteWithSchema(matchedRoute) && matchedRoute.schema?.response) {
				const routeWithSchema = matchedRoute;
				const responseSchema = routeWithSchema.schema.response;
				if (responseSchema) {
					const validationResult = validateSchema(responseSchema, result, "response");
					if (!validationResult.success) {
						return createErrorResponse("Internal Server Error: Response validation failed", 500);
					}
					return new Response(JSON.stringify(validationResult.data), {
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			return new Response(JSON.stringify(result), {
				headers: { "Content-Type": "application/json" },
			});
		};

		// Build middleware pipeline - skip if no middlewares
		let pipeline: () => Promise<Response> = handler;

		if (this.middlewares.length > 0) {
			for (let i = this.middlewares.length - 1; i >= 0; i--) {
				const middleware = this.middlewares[i];
				const next = pipeline;
				if (!middleware) {
					continue;
				}

				pipeline = async (): Promise<Response> => {
					return middleware(request, next);
				};
			}
		}

		try {
			return await pipeline();
		} catch (error) {
			return createErrorResponse(
				"Internal Server Error",
				500,
				error instanceof Error ? error.message : undefined,
			);
		}
	}
}

export class WebServer {
	private router: Router;
	private port: number;
	private host: string;
	private server: ReturnType<typeof Bun.serve> | null = null;

	constructor(config: { port?: number; host?: string } = {}) {
		this.router = new Router();
		this.port = config.port ?? 3000;
		this.host = config.host ?? "localhost";
	}

	get(path: string, handler: RouteHandler): this {
		this.router.addRoute({ method: "GET", path, handler });
		return this;
	}

	route(route: RouteDefinition): this {
		this.router.addRoute(route);
		return this;
	}

	post(path: string, handler: RouteHandler): this {
		this.router.addRoute({ method: "POST", path, handler });
		return this;
	}

	put(path: string, handler: RouteHandler): this {
		this.router.addRoute({ method: "PUT", path, handler });
		return this;
	}

	delete(path: string, handler: RouteHandler): this {
		this.router.addRoute({ method: "DELETE", path, handler });
		return this;
	}

	patch(path: string, handler: RouteHandler): this {
		this.router.addRoute({ method: "PATCH", path, handler });
		return this;
	}

	use(middleware: Middleware): this {
		this.router.use(middleware);
		return this;
	}

	async start(): Promise<void> {
		this.server = Bun.serve({
			port: this.port,
			hostname: this.host,
			fetch: (request) => this.router.handle(request),
		});

		console.log(`🦊 WebServer is running at http://${this.host}:${this.port}`);
	}

	async stop(): Promise<void> {
		if (this.server) {
			void this.server.stop();
			this.server = null;
			console.log("WebServer stopped");
		}
	}
}

export const createWebServer = (config: { port?: number; host?: string } = {}): WebServer => {
	return new WebServer(config);
};
