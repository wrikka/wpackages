import { HttpMiddleware, HttpServerResponse } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http";
import { AuthError, RateLimitError } from "@wpackages/security";
import { Cause, Effect, Option } from "effect";

const mapErrorToHttpResponse = (
	error: unknown,
	response: ResponseFactory,
): Effect.Effect<HttpServerResponse.HttpServerResponse> => {
	const tag = error
			&& typeof error === "object"
			&& "_tag" in error
			&& typeof (error as { readonly _tag?: unknown })._tag === "string"
		? (error as { readonly _tag: string })._tag
		: null;

	if (error instanceof AuthError) {
		return response.text(error.message, { status: 401 });
	}
	if (tag === "AuthError") {
		return response.text("Unauthorized", { status: 401 });
	}
	if (error instanceof RateLimitError) {
		return response.text(error.message, { status: 429 });
	}
	if (tag === "RateLimitError") {
		return response.text("Rate limit exceeded", { status: 429 });
	}
	if (error instanceof Error) {
		return response.text(error.message, { status: 500 });
	}
	return response.text("Internal server error", { status: 500 });
};

export const errorMiddleware = HttpMiddleware.make((app) =>
	Effect.gen(function*() {
		const response = yield* ResponseFactory.Current;
		return yield* app.pipe(
			Effect.catchTags({
				RouteNotFound: () => response.text("Route Not Found", { status: 404 }),
			}),
			Effect.catchAllCause((cause) => {
				const failure = Cause.failureOption(cause);
				if (Option.isSome(failure)) {
					return mapErrorToHttpResponse(failure.value, response);
				}
				return response.text(Cause.pretty(cause), { status: 500 });
			}),
		);
	})
);
