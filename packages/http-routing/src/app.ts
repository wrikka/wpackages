import { HttpRouter } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http";
import { Effect } from "effect";
import { HttpRoutingConfig } from "./config";

export const createHttpApp = <E, R>(appRoutes: HttpRouter.HttpRouter<E, R>) =>
	Effect.gen(function*() {
		const config = yield* HttpRoutingConfig.Current;
		const response = yield* ResponseFactory.Current;
		const payload = config.env.PAYLOAD_BYTES > 0 ? "x".repeat(config.env.PAYLOAD_BYTES) : "";

		const baseRoutes = HttpRouter.empty.pipe(
			HttpRouter.get("/", response.text("Hello World")),
			HttpRouter.get("/r/:id", response.text(payload)),
		);

		return baseRoutes.pipe(HttpRouter.mount("/", appRoutes));
	});
