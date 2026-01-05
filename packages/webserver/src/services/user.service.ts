import { Database, users } from "@wpackages/database";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer, Schema } from "effect";

// --- Errors ---
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
	"UserNotFoundError",
	{
		id: Schema.Number,
	},
) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
	"DatabaseError",
	{
		error: Schema.Unknown,
	},
) {}

// --- Service Definition ---
const UserSchema = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
});
export type User = Schema.Schema.Type<typeof UserSchema>;

export class UserService extends Context.Tag("UserService")<UserService, {
	readonly getUser: (id: number) => Effect.Effect<User, UserNotFoundError | DatabaseError>;
}>() {}

// --- Live Implementation ---
export const UserServiceLive = Layer.effect(
	UserService,
	Effect.map(Database, (database) =>
		UserService.of({
			getUser: (id: number) =>
				Effect.tryPromise({
					try: () =>
						database.db.query.users.findFirst({
							where: eq(users.id, id),
						}),
					catch: (error) => new DatabaseError({ error }),
				}).pipe(
					Effect.flatMap((user) => {
						if (!user) {
							return Effect.fail(new UserNotFoundError({ id }));
						}
						return Schema.decode(UserSchema)(user).pipe(
							Effect.mapError((decodeError) => new DatabaseError({ error: decodeError })),
						);
					}),
				),
		})),
);
