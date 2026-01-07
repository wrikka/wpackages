import { HttpRouter, HttpServerResponse } from "@effect/platform";
import { Effect } from "effect";
import path from "node:path";
import { ConfigLive } from "../../config";

export const staticRoute = HttpRouter.get(
	"/static",
	Effect.gen(function*() {
		const config = yield* ConfigLive;
		const base = config.STATIC_ASSETS_PATH ?? "public";
		const filePath = path.resolve(base, "index.html");
		const html = yield* Effect.tryPromise({
			try: () => Bun.file(filePath).text(),
			catch: (error) => (error instanceof Error ? error : new Error(String(error))),
		});
		return HttpServerResponse.text(html);
	}),
);
