import { Effect } from "effect";
import type { Middleware, MiddlewareContext } from "../types";
import { MiddlewareError } from "../error";

export const createMiddleware = (
	name: string,
	execute: (context: MiddlewareContext) => Effect.Effect<Response, MiddlewareError>,
): Middleware => Object.freeze({ name, execute });

export const composeMiddleware = (
	middlewares: readonly Middleware[],
): (context: MiddlewareContext) => Effect.Effect<Response, MiddlewareError> => {
	return (context) => {
		let index = 0;

		const next = (): Effect.Effect<Response, MiddlewareError> => {
			if (index >= middlewares.length) {
				return Effect.succeed(new Response("OK", { status: 200 }));
			}

			const middleware = middlewares[index];
			index++;

			if (!middleware) {
				return Effect.fail(new MiddlewareError("unknown", new Error("Middleware not found")));
			}

			return Effect.catchAll(
				middleware.execute({ ...context, next }),
				(error) => Effect.fail(new MiddlewareError(middleware.name, error)),
			);
		};

		return next();
	};
};

export const loggingMiddleware = createMiddleware("logging", (context) =>
	Effect.sync(() => {
		const { request } = context;
		console.log(`[${request.method}] ${request.url}`);
	}).pipe(Effect.flatMap(() => context.next())),
);

export const corsMiddleware = (allowedOrigins: readonly string[] = ["*"]): Middleware =>
	createMiddleware("cors", (context) =>
		Effect.gen(function* () {
			const origin = context.request.headers.get("origin");
			const allowed = allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin));

			const response = yield* Effect.tryPromise({
				try: () => Effect.runPromise(context.next()),
				catch: (error) => new Error(`Failed to execute next middleware: ${error}`),
			});

			const headers = new Headers(response.headers);
			if (allowed) {
				headers.set("Access-Control-Allow-Origin", origin ?? "*");
			}
			headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		}),
	);
