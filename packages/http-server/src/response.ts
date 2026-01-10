import { Context, Effect, Layer } from "effect";

export type ServerConfig = {
	readonly port: number;
	readonly host: string;
};

export type ResponseFactoryOptions = {
	readonly withSecurityHeaders?: boolean;
	readonly cors?: {
		readonly origin: string | string[];
		readonly methods?: string[];
		readonly headers?: string[];
	};
};

export type HttpServerOptions = ResponseFactoryOptions & {
	readonly onError?: (error: unknown) => Response;
};

export class ResponseFactory extends Context.Tag("ResponseFactory")<
	ResponseFactory,
	{
		readonly createResponse: (data: unknown, status?: number, headers?: HeadersInit) => Effect.Effect<Response, never>;
		readonly createJsonResponse: <A>(data: A, status?: number) => Effect.Effect<Response, never>;
		readonly createErrorResponse: (error: unknown, status?: number) => Effect.Effect<Response, never>;
		readonly json: <A>(data: A, status?: number, headers?: HeadersInit) => Effect.Effect<Response, never>;
		readonly html: (data: string, status?: number, headers?: HeadersInit) => Effect.Effect<Response, never>;
		readonly text: (data: string, status?: number, headers?: HeadersInit) => Effect.Effect<Response, never>;
	}
>() {}

export const ResponseFactoryLive = (options: ResponseFactoryOptions = {}) =>
	Layer.effect(
		ResponseFactory,
		Effect.succeed(
			ResponseFactory.of({
				createResponse: (data, status = 200, headers) =>
					Effect.sync(() => {
						const responseHeaders = new Headers(headers);

						if (options.withSecurityHeaders) {
							responseHeaders.set("X-Content-Type-Options", "nosniff");
							responseHeaders.set("X-Frame-Options", "DENY");
							responseHeaders.set("X-XSS-Protection", "1; mode=block");
							responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
							responseHeaders.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
						}

						if (options.cors) {
							const origins = Array.isArray(options.cors.origin) ? options.cors.origin : [options.cors.origin];
							responseHeaders.set("Access-Control-Allow-Origin", origins.join(", "));
							responseHeaders.set("Access-Control-Allow-Methods", options.cors.methods?.join(", ") ?? "GET, POST, PUT, DELETE, PATCH, OPTIONS");
							responseHeaders.set("Access-Control-Allow-Headers", options.cors.headers?.join(", ") ?? "Content-Type, Authorization");
						}

						return new Response(data as BodyInit, { status, headers: responseHeaders });
					}),
				createJsonResponse: <A>(data: A, status = 200) =>
					Effect.sync(() => {
						const headers = new Headers({ "Content-Type": "application/json" });

						if (options.withSecurityHeaders) {
							headers.set("X-Content-Type-Options", "nosniff");
							headers.set("X-Frame-Options", "DENY");
							headers.set("X-XSS-Protection", "1; mode=block");
						}

						if (options.cors) {
							const origins = Array.isArray(options.cors.origin) ? options.cors.origin : [options.cors.origin];
							headers.set("Access-Control-Allow-Origin", origins.join(", "));
							headers.set("Access-Control-Allow-Methods", options.cors.methods?.join(", ") ?? "GET, POST, PUT, DELETE, PATCH, OPTIONS");
							headers.set("Access-Control-Allow-Headers", options.cors.headers?.join(", ") ?? "Content-Type, Authorization");
						}

						return new Response(JSON.stringify(data), { status, headers });
					}),
				createErrorResponse: (error, status = 500) =>
					Effect.sync(() => {
						const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
						return new Response(JSON.stringify({ error: errorMessage }), {
							status,
							headers: { "Content-Type": "application/json" },
						});
					}),
				json: <A>(data: A, status = 200, headers?: HeadersInit) =>
					Effect.sync(() => {
						const responseHeaders = new Headers(headers);
						responseHeaders.set("Content-Type", "application/json");

						if (options.withSecurityHeaders) {
							responseHeaders.set("X-Content-Type-Options", "nosniff");
							responseHeaders.set("X-Frame-Options", "DENY");
							responseHeaders.set("X-XSS-Protection", "1; mode=block");
						}

						if (options.cors) {
							const origins = Array.isArray(options.cors.origin) ? options.cors.origin : [options.cors.origin];
							responseHeaders.set("Access-Control-Allow-Origin", origins.join(", "));
							responseHeaders.set("Access-Control-Allow-Methods", options.cors.methods?.join(", ") ?? "GET, POST, PUT, DELETE, PATCH, OPTIONS");
							responseHeaders.set("Access-Control-Allow-Headers", options.cors.headers?.join(", ") ?? "Content-Type, Authorization");
						}

						return new Response(JSON.stringify(data), { status, headers: responseHeaders });
					}),
				html: (data: string, status = 200, headers?: HeadersInit) =>
					Effect.sync(() => {
						const responseHeaders = new Headers(headers);
						responseHeaders.set("Content-Type", "text/html; charset=utf-8");

						if (options.withSecurityHeaders) {
							responseHeaders.set("X-Content-Type-Options", "nosniff");
							responseHeaders.set("X-Frame-Options", "DENY");
							responseHeaders.set("X-XSS-Protection", "1; mode=block");
						}

						if (options.cors) {
							const origins = Array.isArray(options.cors.origin) ? options.cors.origin : [options.cors.origin];
							responseHeaders.set("Access-Control-Allow-Origin", origins.join(", "));
							responseHeaders.set("Access-Control-Allow-Methods", options.cors.methods?.join(", ") ?? "GET, POST, PUT, DELETE, PATCH, OPTIONS");
							responseHeaders.set("Access-Control-Allow-Headers", options.cors.headers?.join(", ") ?? "Content-Type, Authorization");
						}

						return new Response(data, { status, headers: responseHeaders });
					}),
				text: (data: string, status = 200, headers?: HeadersInit) =>
					Effect.sync(() => {
						const responseHeaders = new Headers(headers);
						responseHeaders.set("Content-Type", "text/plain; charset=utf-8");

						if (options.withSecurityHeaders) {
							responseHeaders.set("X-Content-Type-Options", "nosniff");
							responseHeaders.set("X-Frame-Options", "DENY");
							responseHeaders.set("X-XSS-Protection", "1; mode=block");
						}

						if (options.cors) {
							const origins = Array.isArray(options.cors.origin) ? options.cors.origin : [options.cors.origin];
							responseHeaders.set("Access-Control-Allow-Origin", origins.join(", "));
							responseHeaders.set("Access-Control-Allow-Methods", options.cors.methods?.join(", ") ?? "GET, POST, PUT, DELETE, PATCH, OPTIONS");
							responseHeaders.set("Access-Control-Allow-Headers", options.cors.headers?.join(", ") ?? "Content-Type, Authorization");
						}

						return new Response(data, { status, headers: responseHeaders });
					}),
			}),
		),
	);
