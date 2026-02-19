import { Logger } from "@wpackages/logger";
import { Effect } from "effect";
import type { RouteMatch } from "../types";

export interface RouteLoggerOptions {
	readonly logLevel?: "debug" | "info" | "warn" | "error";
	readonly logRequests?: boolean;
	readonly logResponses?: boolean;
	readonly logErrors?: boolean;
}

export const createRouteLogger = (options: RouteLoggerOptions = {}) => {
	const opts = {
		logLevel: options.logLevel ?? "info",
		logRequests: options.logRequests ?? true,
		logResponses: options.logResponses ?? true,
		logErrors: options.logErrors ?? true,
	};

	return {
		logRouteMatch: (match: RouteMatch) =>
			Effect.gen(function* () {
				const logger = yield* Logger;
				if (opts.logRequests) {
					yield* logger.info("Route matched", {
						path: match.route.path,
						params: match.params,
						query: match.query,
					});
				}
			}),

		logRouteError: (error: Error, match?: RouteMatch) =>
			Effect.gen(function* () {
				const logger = yield* Logger;
				if (opts.logErrors) {
					yield* logger.error("Route error", {
						error: error.message,
						path: match?.route.path,
						params: match?.params,
					});
				}
			}),

		logRouteNotFound: (pathname: string) =>
			Effect.gen(function* () {
				const logger = yield* Logger;
				if (opts.logRequests) {
					yield* logger.warn("Route not found", { pathname });
				}
			}),

		logRequest: (request: Request) =>
			Effect.gen(function* () {
				const logger = yield* Logger;
				if (opts.logRequests) {
					const url = new URL(request.url);
					yield* logger.info("Incoming request", {
						method: request.method,
						pathname: url.pathname,
						search: url.search,
					});
				}
			}),

		logResponse: (status: number, match?: RouteMatch) =>
			Effect.gen(function* () {
				const logger = yield* Logger;
				if (opts.logResponses) {
					yield* logger.info("Response sent", {
						status,
						path: match?.route.path,
					});
				}
			}),
	};
};
