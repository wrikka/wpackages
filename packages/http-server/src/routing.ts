import { Context, Effect, Layer } from "effect";
import * as Schema from "@effect/schema/Schema";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type RouteParams = Record<string, string | number | boolean>;

export type RouteHandler<R = unknown, E = unknown, A = unknown> = (
	request: Request,
	params: RouteParams,
) => Effect.Effect<A, E, R>;

export type RouteSchema = {
	readonly query?: Schema.Schema<any, any>;
	readonly body?: Schema.Schema<any, any>;
	readonly response?: Schema.Schema<any, any>;
};

export type RouteDefinition<R = unknown, E = unknown, A = unknown> = {
	readonly method: HttpMethod;
	readonly path: string;
	readonly handler: RouteHandler<R, E, A>;
	readonly schema?: RouteSchema;
};

export type HttpRoutingConfigInput = Record<string, RouteDefinition>;

export class HttpRoutingConfig extends Context.Tag("HttpRoutingConfig")<
	HttpRoutingConfig,
	{
		readonly routes: ReadonlyArray<RouteDefinition>;
		readonly match: (request: Request) => Effect.Effect<{ route: RouteDefinition; params: RouteParams }, "RouteNotFoundError">;
	}
>() {}

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

export const HttpRoutingConfigLive = (routesInput: HttpRoutingConfigInput) =>
	Layer.effect(
		HttpRoutingConfig,
		Effect.sync(() => {
			const routes = Object.values(routesInput);

			return HttpRoutingConfig.of({
				routes,
				match: (request: Request) =>
					Effect.sync(() => {
						const url = new URL(request.url);
						const pathname = url.pathname;
						const method = request.method as HttpMethod;

						for (const route of routes) {
							if (route.method !== method) {
								continue;
							}

							const params = parsePathParams(route.path, pathname);
							if (params !== null) {
								return { route, params };
							}
						}

						return null;
					}).pipe(
						Effect.flatMap((match) =>
							match ? Effect.succeed(match) : Effect.fail("RouteNotFoundError" as const),
						),
					),
			});
		}),
	);
