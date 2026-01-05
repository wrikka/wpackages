import { HttpRouter } from "@effect/platform";
import { Database } from "@wpackages/database";
import { ResponseFactory } from "@wpackages/http";
import { Effect, Option } from "effect";
import { api } from "../api";

export const healthz = HttpRouter.get(
	api.health.path,
	Effect.gen(function*() {
		const response = yield* ResponseFactory.Current;
		return yield* response.json({ ok: true });
	}),
);

export const readyz = HttpRouter.get(
	api.ready.path,
	Effect.gen(function*() {
		const response = yield* ResponseFactory.Current;
		const maybeDb = yield* Effect.serviceOption(Database);
		if (Option.isNone(maybeDb)) {
			return yield* response.json({ ready: true, db: "disabled" as const });
		}

		const db = maybeDb.value;
		const ok = yield* Effect.isSuccess(Effect.tryPromise(() => db.pool.query("SELECT 1")));

		if (ok) {
			return yield* response.json({ ready: true, db: "ok" as const });
		}

		return yield* response.json({ ready: false, db: "error" as const }, { status: 503 });
	}),
);
