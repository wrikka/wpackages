import { HttpMiddleware, HttpServerRequest } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http";
import { authMiddleware, rateLimitMiddleware } from "@wpackages/security";
import { Effect } from "effect";
import { HttpRoutingConfig } from "../config";
import { errorMiddleware } from "./error-mapper.service";

const bodyLimitMiddleware = HttpMiddleware.make((app) =>
	Effect.gen(function*() {
		const config = yield* HttpRoutingConfig.Current;
		const responseFactory = yield* ResponseFactory.Current;
		const req = yield* HttpServerRequest.HttpServerRequest;
		const raw = req.headers["content-length"];
		if (typeof raw === "string") {
			const n = Number(raw);
			if (Number.isFinite(n) && n > config.env.MAX_BODY_BYTES) {
				return yield* responseFactory.text("Payload Too Large", { status: 413 });
			}
		}
		return yield* app;
	})
);

const isProtected = (path: string) => path.startsWith("/users");

export const appMiddleware = HttpMiddleware.make((app) =>
	Effect.gen(function*() {
		const config = yield* HttpRoutingConfig.Current;
		const env = config.env;

		const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS?.trim()
			? env.CORS_ALLOWED_ORIGINS.split(",").map((s: string) => s.trim()).filter(Boolean)
			: [];

		const middlewares = [
			HttpMiddleware.xForwardedHeaders,
			env.ENABLE_RATE_LIMIT ? rateLimitMiddleware({ isRateLimited: isProtected }) : null,
			env.ENABLE_AUTH ? authMiddleware({ isProtected }) : null,
			env.ENABLE_BODY_LIMIT ? bodyLimitMiddleware : null,
			env.ENABLE_QUERY_PARSER ? HttpMiddleware.searchParamsParser : null,
			env.ENABLE_CORS ? HttpMiddleware.cors({ allowedOrigins: corsAllowedOrigins }) : null,
			env.ENABLE_HTTP_LOGGER ? HttpMiddleware.logger : null,
			errorMiddleware,
		];

		const definedMiddlewares = middlewares.filter((m): m is NonNullable<typeof m> => m !== null);
		const composed = definedMiddlewares.reduceRight((acc, middleware) => middleware(acc), app);
		return yield* composed;
	})
);
