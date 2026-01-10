import { HttpRouter } from "@effect/platform";
import { ResponseFactory } from "@wpackages/http-server";
import { Effect, Schema } from "effect";
import { UserService } from "../../services/user.service";
import { api } from "../api";

const UserIdParams = Schema.Struct({
	id: Schema.NumberFromString,
});

export const userRoute = HttpRouter.get(
	api.user.path,
	Effect.gen(function*() {
		const response = yield* Effect.service(ResponseFactory);
		const service = yield* Effect.service(UserService);
		const { id } = yield* HttpRouter.schemaPathParams(UserIdParams);
		const user = yield* service.getUser(id);
		return response.json({ user });
	}).pipe(
		Effect.catchTags({
			"UserNotFoundError": (e) =>
				Effect.flatMap(Effect.service(ResponseFactory), (r) => r.text(`User ${e.id} not found`, { status: 404 })),
			"DatabaseError": () =>
				Effect.flatMap(Effect.service(ResponseFactory), (r) => r.text("Database error", { status: 503 })),
		}),
	),
);
