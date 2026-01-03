import { eq } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { users } from "../db";
import { Database } from "../db/database.service";

// --- Errors ---
export class UserNotFoundError {
	readonly _tag = "UserNotFoundError";
	constructor(readonly userId: number) {}
}

export class DatabaseError {
	readonly _tag = "DatabaseError";
	constructor(readonly error: unknown) {}
}

// --- Service Definition ---
export interface UserService {
	readonly getUserById: (
		id: number,
	) => Effect.Effect<
		typeof users.$inferSelect,
		UserNotFoundError | DatabaseError
	>;
}

export const UserService = Context.GenericTag<UserService>("UserService");

// --- Live Implementation ---
export const UserServiceLive = Layer.effect(
	UserService,
	Effect.map(Database, (database) =>
		UserService.of({
			getUserById: (id: number) =>
				Effect.tryPromise({
					try: () =>
						database.db.query.users.findFirst({
							where: eq(users.id, id),
						}),
					catch: (error) => new DatabaseError(error),
				}).pipe(
					Effect.flatMap(Option.fromNullable),
					Effect.mapError(() => new UserNotFoundError(id)),
				),
		})),
);
