import { Effect } from "effect";

export type MiddlewareContext = {
	readonly request: Request;
	readonly next: () => Effect.Effect<Response, never>;
	readonly params?: Record<string, string | number | boolean>;
};

export type Middleware = {
	readonly name: string;
	readonly execute: (context: MiddlewareContext) => Effect.Effect<Response, never>;
};

export const createMiddleware = (
	name: string,
	execute: (context: MiddlewareContext) => Effect.Effect<Response, never>,
): Middleware => Object.freeze({ name, execute });

export const composeMiddleware = (
	middlewares: readonly Middleware[],
): (context: MiddlewareContext) => Effect.Effect<Response, never> => {
	return (context) => {
		let index = 0;

		const next = (): Effect.Effect<Response, never> => {
			if (index >= middlewares.length) {
				return Effect.succeed(new Response("OK", { status: 200 }));
			}

			const middleware = middlewares[index];
			index++;

			if (!middleware) {
				return Effect.die(new Error("Middleware not found"));
			}

			return middleware.execute({ ...context, next });
		};

		return next();
	};
};

export const loggingMiddleware = createMiddleware("logging", (context) =>
	Effect.gen(function* () {
		const { request, next } = context;
		const start = Date.now();
		console.log(`[${request.method}] ${request.url}`);

		const response = yield* next();

		const duration = Date.now() - start;
		console.log(`[${request.method}] ${request.url} - ${response.status} (${duration}ms)`);

		return response;
	}),
);

export const corsMiddleware = (allowedOrigins: readonly string[] = ["*"]): Middleware =>
	createMiddleware("cors", (context) =>
		Effect.gen(function* () {
			const origin = context.request.headers.get("origin");
			const allowed = allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin));

			const response = yield* context.next();

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

export const authMiddleware = (validateToken: (token: string) => boolean): Middleware =>
	createMiddleware("auth", (context) =>
		Effect.gen(function* () {
			const authHeader = context.request.headers.get("authorization");

			if (!authHeader) {
				return new Response("Unauthorized", { status: 401 });
			}

			const token = authHeader.replace("Bearer ", "");

			if (!validateToken(token)) {
				return new Response("Forbidden", { status: 403 });
			}

			return yield* context.next();
		}),
	);

export const rateLimitMiddleware = (options: { maxRequests: number; windowMs: number }): Middleware => {
	const requests = new Map<string, { count: number; resetTime: number }>();

	return createMiddleware("rateLimit", (context) =>
		Effect.gen(function* () {
			const ip = context.request.headers.get("x-forwarded-for") ?? "unknown";
			const now = Date.now();

			const record = requests.get(ip);

			if (!record || now > record.resetTime) {
				requests.set(ip, { count: 1, resetTime: now + options.windowMs });
				return yield* context.next();
			}

			if (record.count >= options.maxRequests) {
				return new Response("Too Many Requests", {
					status: 429,
					headers: { "Retry-After": Math.ceil((record.resetTime - now) / 1000).toString() },
				});
			}

			record.count++;
			return yield* context.next();
		}),
	);
};

export const appMiddleware = {
	logging: loggingMiddleware,
	cors: corsMiddleware,
	auth: authMiddleware,
	rateLimit: rateLimitMiddleware,
};
