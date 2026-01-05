import { HttpMiddleware, HttpServerRequest } from "@effect/platform";
import * as Response from "@wpackages/http";
import { getPathnameFromUrl } from "@wpackages/utils";
import { Effect, Layer } from "effect";
import { AuthError, AuthService } from "../services/auth.service";
import type { SecurityEnv } from "../types";

export const AuthLive = (env: SecurityEnv) => Layer.succeed(AuthService.Current, new AuthService(env.JWT_SECRET));

const getTokenFromRequest = (req: HttpServerRequest.HttpServerRequest): string | null => {
	const header = req.headers["authorization"];
	if (typeof header === "string" && header.startsWith("Bearer ")) {
		return header.substring(7);
	}
	return null;
};

interface AuthMiddlewareOptions {
	isProtected: (path: string) => boolean;
}

export const authMiddleware = (options: AuthMiddlewareOptions) =>
	HttpMiddleware.make((app) =>
		Effect.gen(function*() {
			const req = yield* HttpServerRequest.HttpServerRequest;
			const auth = yield* AuthService.Current;
			const pathname = getPathnameFromUrl(req.url);

			if (!options.isProtected(pathname)) {
				return yield* app;
			}

			const token = getTokenFromRequest(req);
			if (!token) {
				return yield* Response.text("Unauthorized", { status: 401 });
			}

			yield* auth.validateToken(token);
			return yield* app;
		}).pipe(
			Effect.catchTag("AuthError", (e) => Response.text(e.message, { status: 401 })),
		)
	);
