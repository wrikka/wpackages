import { Effect } from "effect";
import type { HttpMethod, RouteMatch, WRouteRecord } from "../types";
import { matchRoute } from "../utils";
import { RouteNotFoundError } from "../error";

export type RouteHandler = (request: Request, params: Readonly<Record<string, string | number | boolean>>) => Effect.Effect<Response, Error>;

export type RouteHandlers = Partial<Record<HttpMethod, RouteHandler>>;

export class ServerRouter {
	private readonly routes: readonly WRouteRecord[];
	private readonly handlers = new Map<string, RouteHandlers>();

	constructor(routes: readonly WRouteRecord[]) {
		this.routes = routes;
	}

	addRoute(path: string, handlers: RouteHandlers): Effect.Effect<void, never> {
		return Effect.sync(() => {
			this.handlers.set(path, handlers);
		});
	}

	addRoutes(routeMap: Readonly<Record<string, RouteHandlers>>): Effect.Effect<void, never> {
		return Effect.sync(() => {
			for (const [path, handlers] of Object.entries(routeMap)) {
				this.handlers.set(path, handlers);
			}
		});
	}

	match(request: Request): Effect.Effect<RouteMatch, RouteNotFoundError> {
		const url = new URL(request.url);
		const pathname = url.pathname;
		const match = matchRoute(pathname, this.routes);

		if (!match) {
			return Effect.fail(new RouteNotFoundError(pathname));
		}

		return Effect.succeed(match);
	}

	handle(request: Request): Effect.Effect<Response, RouteNotFoundError | Error> {
		return Effect.flatMap(
			this.match(request),
			(match) =>
				Effect.sync(() => {
					const method = request.method as HttpMethod;
					const handlers = this.handlers.get(match.route.path);

					if (!handlers) {
						return new Response("Not Found", { status: 404 });
					}

					const handler = handlers[method];

					if (!handler) {
						return new Response("Method Not Allowed", { status: 405 });
					}

					return Effect.runSync(handler(request, match.params));
				}),
		);
	}

	listen(port: number): Effect.Effect<void, Error> {
		return Effect.sync(() => {
			Bun.serve({
				port,
				fetch: async (request): Promise<Response> => {
					const response = await Effect.runPromise(this.handle(request));
					return response as Response;
				},
			});

			console.log(`Server listening on http://localhost:${port}`);
		});
	}
}

export const createServerRouter = (routes: readonly WRouteRecord[]): ServerRouter => {
	return new ServerRouter(routes);
};
