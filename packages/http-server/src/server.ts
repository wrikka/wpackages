import * as Schema from "@effect/schema/Schema";
import { Context, Effect, Layer } from "effect";
import type { Middleware } from "./middleware";
import { type HttpServerOptions, ResponseFactory, ResponseFactoryLive, type ServerConfig } from "./response";
import { HttpRoutingConfig, HttpRoutingConfigLive, type RouteDefinition } from "./routing";

export class HttpServer extends Context.Tag("HttpServer")<
	HttpServer,
	{
		readonly start: () => Effect.Effect<void, never>;
		readonly stop: () => Effect.Effect<void, never>;
	}
>() {}

const handleRequest = (
	routingConfig: HttpRoutingConfig,
	responseFactory: ResponseFactory,
	middlewares: readonly Middleware[] = [],
	onError?: (error: unknown) => Response,
) => {
	return async (request: Request): Promise<Response> => {
		const program = Effect.gen(function*() {
			const { route, params } = yield* routingConfig.match(request);

			let body: unknown = undefined;

			if ((request.method === "POST" || request.method === "PUT" || request.method === "PATCH") && request.body) {
				body = yield* Effect.tryPromise({
					try: () => request.json(),
					catch: () => ({ _tag: "JsonParseError" as const }),
				});
			}

			if (route.schema?.body) {
				const parseBody = Schema.decodeUnknown(route.schema.body);
				body = yield* parseBody(body);
			}

			const handler = route.handler;
			const result = yield* handler(request, params);

			if (route.schema?.response) {
				const encodeResponse = Schema.encode(route.schema.response);
				const encodedResult = yield* encodeResponse(result);
				return yield* responseFactory.createJsonResponse(encodedResult);
			}

			return yield* responseFactory.createJsonResponse(result);
		}).pipe(
			Effect.catchAll((error) => {
				if (onError) {
					return Effect.sync(() => onError(error));
				}
				return responseFactory.createErrorResponse(error);
			}),
		);

		return Effect.runPromise(program);
	};
};

export const createHttpServer = (
	config: ServerConfig,
	routes: Record<string, RouteDefinition>,
	options: HttpServerOptions = {},
	middlewares: readonly Middleware[] = [],
) => {
	const routingConfigLayer = HttpRoutingConfigLive(routes);
	const responseFactoryLayer = ResponseFactoryLive(options);

	const serverLayer = Layer.mergeAll(routingConfigLayer, responseFactoryLayer);

	return Layer.effect(
		HttpServer,
		Effect.gen(function*() {
			const routingConfig = yield* HttpRoutingConfig;
			const responseFactory = yield* ResponseFactory;

			let server: ReturnType<typeof Bun.serve> | null = null;

			return HttpServer.of({
				start: () =>
					Effect.sync(() => {
						server = Bun.serve({
							port: config.port,
							hostname: config.host,
							fetch: handleRequest(routingConfig, responseFactory, middlewares, options.onError),
						});
						console.log(`Server listening on http://${config.host}:${config.port}`);
					}),
				stop: () =>
					Effect.sync(() => {
						if (server) {
							server.stop();
							server = null;
							console.log("Server stopped");
						}
					}),
			});
		}),
	).pipe(Layer.provide(serverLayer));
};

export const startServer = (
	config: ServerConfig,
	routes: Record<string, RouteDefinition>,
	options: HttpServerOptions = {},
	middlewares: readonly Middleware[] = [],
) => {
	return Effect.gen(function*() {
		const server = yield* createHttpServer(config, routes, options, middlewares);
		yield* server.start();
	});
};
