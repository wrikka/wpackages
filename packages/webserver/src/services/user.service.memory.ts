import { Context, Effect, Layer } from "effect";
import { users } from "../db";
import { UserNotFoundError, UserService } from "./user.service";

export interface InMemoryUsers {
	readonly byId: ReadonlyMap<number, typeof users.$inferSelect>;
}

export const InMemoryUsers = Context.GenericTag<InMemoryUsers>("InMemoryUsers");

export const UserServiceInMemory = Layer.effect(
	UserService,
	Effect.map(InMemoryUsers, ({ byId }) =>
		UserService.of({
			getUserById: (id) => {
				const user = byId.get(id);
				if (!user) {
					return Effect.fail(new UserNotFoundError(id));
				}
				return Effect.succeed(user);
			},
		})),
);
