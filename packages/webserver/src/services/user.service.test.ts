import { Database } from "@wpackages/database";
import { Cause, Effect, Exit, Layer, Option } from "effect";
import { describe, expect, test, vi } from "vitest";
import { UserNotFoundError, UserService, UserServiceLive } from "./user.service";

describe("UserService", () => {
	test("getUserById should return a user when found", async () => {
		// Mock Database Service
		const mockDb = {
			db: {
				query: {
					users: {
						findFirst: vi.fn().mockResolvedValue({ id: 1, name: "John Doe" }),
					},
				},
			},
		};

		const DatabaseTest = Layer.succeed(Database, mockDb as any);
		const AppLayer = UserServiceLive.pipe(Layer.provide(DatabaseTest));
		const program = UserService.pipe(Effect.flatMap((s) => s.getUserById(1)));

		const result = await Effect.runPromiseExit(
			program.pipe(Effect.provide(AppLayer)),
		);

		if (!Exit.isSuccess(result)) {
			throw new Error("Expected success Exit");
		}
		expect(result.value).toEqual({ id: 1, name: "John Doe" });
		expect(mockDb.db.query.users.findFirst).toHaveBeenCalledTimes(1);
		expect(mockDb.db.query.users.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.anything(),
			}),
		);
	});

	test("getUserById should return UserNotFoundError when user not found", async () => {
		// Mock Database Service
		const mockDb = {
			db: {
				query: {
					users: {
						findFirst: vi.fn().mockResolvedValue(undefined),
					},
				},
			},
		};

		const DatabaseTest = Layer.succeed(Database, mockDb as any);
		const AppLayer = UserServiceLive.pipe(Layer.provide(DatabaseTest));
		const program = UserService.pipe(Effect.flatMap((s) => s.getUserById(999)));

		const result = await Effect.runPromiseExit(
			program.pipe(Effect.provide(AppLayer)),
		);

		if (!Exit.isFailure(result)) {
			throw new Error("Expected failure Exit");
		}
		const failure = Cause.failureOption(result.cause);
		if (!Option.isSome(failure)) {
			throw new Error("Expected failure cause to contain a failure value");
		}
		expect(failure.value).toBeInstanceOf(UserNotFoundError);
	});
});
