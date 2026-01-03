import { Context, Effect, Layer } from "effect";
import { ApplicationError } from "../error";

// Mock user type
export interface User {
	readonly id: number;
	readonly name: string;
}

export interface ApiClient {
	readonly getUsers: Effect.Effect<ReadonlyArray<User>, Error>;
}

export const ApiClient = Context.Tag<ApiClient>();

export const ApiClientMock = (users: ReadonlyArray<User>) =>
	Layer.succeed(ApiClient, {
		getUsers: Effect.succeed(users),
	});

export const ApiClientLive = Layer.succeed(
	ApiClient,
	{
		getUsers: Effect.gen(function*(_) {
			const baseUrl = yield* _(
				Effect.sync(() => process.env.API_BASE_URL).pipe(
					Effect.flatMap((value) =>
						value && value.trim().length > 0
							? Effect.succeed(value)
							: Effect.fail(
								new ApplicationError({ message: "Missing API_BASE_URL" }),
							)
					),
				),
			);

			const response = yield* _(
				Effect.tryPromise({
					try: () => fetch(`${baseUrl.replace(/\/+$/, "")}/users`),
					catch: (cause) => new Error(String(cause)),
				}),
			);

			if (!response.ok) {
				return yield* _(
					Effect.fail(new ApplicationError({ message: `Request failed: ${response.status}` })),
				);
			}

			const data = yield* _(
				Effect.tryPromise({
					try: async () => (await response.json()) as unknown,
					catch: (cause) => new Error(String(cause)),
				}),
			);

			if (!Array.isArray(data)) {
				return yield* _(
					Effect.fail(new ApplicationError({ message: "Invalid users response" })),
				);
			}

			return data
				.map((u) => {
					const user = u as Partial<User>;
					return {
						id: Number(user.id),
						name: String(user.name),
					} satisfies User;
				})
				.filter((u) => Number.isFinite(u.id) && u.name.length > 0);
		}),
	},
);
