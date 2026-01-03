import { Effect, Exit, Layer } from "effect";
import { describe, expect, test, vi } from "vitest";
import { Database } from "../db/database.service";
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

		expect(Exit.isSuccess(result)).toBe(true);
		if (Exit.isSuccess(result)) {
			expect(result.value).toEqual({ id: 1, name: "John Doe" });
		}
		expect(mockDb.db.query.users.findFirst).toHaveBeenCalledWith({
			where: expect.any(Function),
		});
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

		expect(Exit.isFailure(result)).toBe(true);
		if (Exit.isFailure(result)) {
			expect(result.cause.errors[0]).toBeInstanceOf(UserNotFoundError);
		}
	});
});
