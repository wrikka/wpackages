import type { RouteParams, RouteHandler, RouteDefinition, Middleware } from "../types";
import { parsePathParams, createResponse, createErrorResponse, parseQuery } from "../utils";

export class Router {
	private routes: Map<string, RouteDefinition> = new Map();
	private middlewares: Middleware[] = [];

	constructor() {}

	addRoute<R = unknown, E = unknown, A = unknown>(route: RouteDefinition<R, E, A>): this {
		const key = `${route.method}:${route.path}`;
		this.routes.set(key, route);
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

		for (const [key, route] of this.routes.entries()) {
			const [routeMethod, routePath] = key.split(":");

			if (routeMethod !== method) {
				continue;
			}

			const params = parsePathParams(routePath, pathname);
			if (params !== null) {
				let response: Response;

				try {
					const handler = route.handler as RouteHandler;
					const result = await handler(request, params);
					response = createResponse(result);
				} catch (error) {
					response = createErrorResponse(
						"Internal Server Error",
						500,
						error instanceof Error ? error.message : undefined,
					);
				}

				return response;
			}
		}

		return createErrorResponse("Not Found", 404);
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
			this.server.stop();
			this.server = null;
			console.log("WebServer stopped");
		}
	}
}

export const createWebServer = (config: { port?: number; host?: string } = {}): WebServer => {
	return new WebServer(config);
};
