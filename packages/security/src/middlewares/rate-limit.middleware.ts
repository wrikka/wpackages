import { HttpMiddleware, HttpServerRequest } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http";
import { getPathnameFromUrl } from "@wpackages/utils";
import { Effect, Layer, Option } from "effect";
import { RateLimiter } from "../services/rate-limit.service";
import { InMemoryRateLimiterStorage } from "../storage/memory.storage";
import type { SecurityEnv } from "../types";

export const RateLimiterLive = (env: SecurityEnv) =>
	Layer.succeed(
		RateLimiter.Current,
		new RateLimiter(
			new InMemoryRateLimiterStorage(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX),
		),
	);

const getClientIdFromRequest = (req: HttpServerRequest.HttpServerRequest): string => {
	const forwardedFor = req.headers["x-forwarded-for"];
	if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
		return forwardedFor.split(",")[0]?.trim() ?? "unknown";
	}

	return Option.match(req.remoteAddress, {
		onNone: () => "unknown",
		onSome: (ip) => ip,
	});
};

interface RateLimitMiddlewareOptions {
	isRateLimited: (path: string) => boolean;
}

export const rateLimitMiddleware = (options: RateLimitMiddlewareOptions) =>
	HttpMiddleware.make((app) =>
		Effect.gen(function*() {
			const req = yield* HttpServerRequest.HttpServerRequest;
			const limiter = yield* RateLimiter.Current;
			const pathname = getPathnameFromUrl(req.url);

			if (!options.isRateLimited(pathname)) {
				return yield* app;
			}
			const clientId = getClientIdFromRequest(req);

			yield* limiter.check(clientId);
			return yield* app;
		}).pipe(
			Effect.catchTag("RateLimitError", () =>
				Effect.flatMap(ResponseFactory.Current, (r) => r.text("Rate limit exceeded", { status: 429 }))),
		)
	);
