import { Effect, Either, pipe } from "effect";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	AppError,
	AuthenticationError,
	AuthorizationError,
	ConflictError,
	fromEither,
	fromZodError,
	NotFoundError,
	tryPromise,
	ValidationError,
} from "./index";

describe("tryPromise", () => {
	it("should return a successful Effect with the correct value when the promise resolves", async () => {
		const successFn = () => Promise.resolve("success");
		const effect = tryPromise(successFn);
		const result = await Effect.runPromise(effect);
		expect(result).toBe("success");
	});

	it("should return a failed Effect with an AppError when the promise rejects", async () => {
		const error = new Error("Something went wrong");
		const failureFn = () => Promise.reject(error);
		const effect = tryPromise(failureFn, 400);

		const result = await Effect.runPromise(Effect.flip(effect));

		expect(result).toBeInstanceOf(AppError);
		expect(result.message).toBe(error.message);
		expect(result.statusCode).toBe(400);
	});

	it("should handle synchronous functions that return a value", async () => {
		const syncFn = () => "sync success";
		const effect = tryPromise(syncFn);
		const result = await Effect.runPromise(effect);
		expect(result).toBe("sync success");
	});

	it("should handle synchronous functions that throw an error", async () => {
		const error = new Error("Sync error");
		const syncThrowFn = () => {
			throw error;
		};
		const effect = tryPromise(syncThrowFn, 500);
		const result = await Effect.runPromise(Effect.flip(effect));

		expect(result).toBeInstanceOf(AppError);
		expect(result.message).toBe(error.message);
		expect(result.statusCode).toBe(500);
	});
});

describe("Effect.mapError", () => {
	it("should map a failed Effect to a new AppError", async () => {
		const originalError = new Error("Original");
		const effect = Effect.fail(originalError);
		const mappedEffect = pipe(
			effect,
			Effect.mapError((e) => new AppError({ message: `Mapped: ${e.message}`, statusCode: 418 })),
		);

		const result = await Effect.runPromise(Effect.flip(mappedEffect));

		expect(result).toBeInstanceOf(AppError);
		expect(result.message).toBe("Mapped: Original");
		expect(result.statusCode).toBe(418);
	});

	it("should not affect a successful Effect", async () => {
		const effect = Effect.succeed("Still good");
		const mappedEffect = pipe(
			effect,
			Effect.mapError(() => new AppError({ message: "Should not happen", statusCode: 500 })),
		);

		const result = await Effect.runPromise(mappedEffect);
		expect(result).toBe("Still good");
	});
});

describe("fromEither", () => {
	it("should create a successful Effect from a Right", async () => {
		const either = Either.right("Success value");
		const effect = pipe(either, fromEither());
		const result = await Effect.runPromise(effect);
		expect(result).toBe("Success value");
	});

	it("should create a failed Effect with an AppError from a Left", async () => {
		const either = Either.left("Failure reason");
		const effect = pipe(either, fromEither({ statusCode: 404 }));
		const result = await Effect.runPromise(Effect.flip(effect));

		expect(result).toBeInstanceOf(AppError);
		expect(result.message).toBe("Failure reason");
		expect(result.statusCode).toBe(404);
	});

	it("should create a failed Effect with the error message from a Left containing an Error", async () => {
		const error = new Error("Detailed failure");
		const either = Either.left(error);
		const effect = pipe(either, fromEither({ statusCode: 400 }));
		const result = await Effect.runPromise(Effect.flip(effect));

		expect(result).toBeInstanceOf(AppError);
		expect(result.message).toBe(error.message);
		expect(result.statusCode).toBe(400);
	});
});

describe("Tagged Errors", () => {
	it("should correctly catch a specific ValidationError", async () => {
		const effect = Effect.fail(new ValidationError({ message: "Invalid input" }));

		const caughtEffect = effect.pipe(
			Effect.catchTag("ValidationError", (e) => Effect.succeed(`Caught validation error: ${e.message}`)),
		);

		const result = await Effect.runPromise(caughtEffect);
		expect(result).toBe("Caught validation error: Invalid input");
	});

	it("should correctly catch a specific NotFoundError", async () => {
		const effect = Effect.fail(new NotFoundError({ message: "User not found" }));

		const caughtEffect = effect.pipe(
			Effect.catchTag("NotFoundError", (e) => Effect.succeed(`Caught not found error: ${e.message}`)),
		);

		const result = await Effect.runPromise(caughtEffect);
		expect(result).toBe("Caught not found error: User not found");
	});

	it("should not catch an error of a different tag", async () => {
		const effect: Effect.Effect<never, ValidationError | NotFoundError> = Effect.fail(
			new NotFoundError({ message: "Resource not found" }),
		);

		const caughtEffect = effect.pipe(
			Effect.catchTag("ValidationError", (_e) => Effect.succeed(`This should not run`)),
		);

		const result = await Effect.runPromise(Effect.flip(caughtEffect));
		expect(result).toBeInstanceOf(NotFoundError);
		expect(result.message).toBe("Resource not found");
	});

	it("should correctly catch a specific AuthenticationError", async () => {
		const effect = Effect.fail(new AuthenticationError({ message: "Invalid token" }));

		const caughtEffect = effect.pipe(
			Effect.catchTag("AuthenticationError", (e) => Effect.succeed(`Caught auth error: ${e.message}`)),
		);

		const result = await Effect.runPromise(caughtEffect);
		expect(result).toBe("Caught auth error: Invalid token");
	});

	it("should correctly catch a specific AuthorizationError", async () => {
		const effect = Effect.fail(new AuthorizationError({ message: "Permission denied" }));

		const caughtEffect = effect.pipe(
			Effect.catchTag("AuthorizationError", (e) => Effect.succeed(`Caught authorization error: ${e.message}`)),
		);

		const result = await Effect.runPromise(caughtEffect);
		expect(result).toBe("Caught authorization error: Permission denied");
	});

	it("should correctly catch a specific ConflictError", async () => {
		const effect = Effect.fail(new ConflictError({ message: "Email already exists" }));

		const caughtEffect = effect.pipe(
			Effect.catchTag("ConflictError", (e) => Effect.succeed(`Caught conflict error: ${e.message}`)),
		);

		const result = await Effect.runPromise(caughtEffect);
		expect(result).toBe("Caught conflict error: Email already exists");
	});
});

describe("fromZodError", () => {
	it("should create a ValidationError from a ZodError", () => {
		const schema = z.object({
			name: z.string().min(3),
			email: z.string().email(),
		});

		const result = schema.safeParse({ name: "a", email: "invalid" });

		expect(result.success).toBe(false);
		if (result.success) return; // type guard

		const validationError = fromZodError(result.error);

		expect(validationError).toBeInstanceOf(ValidationError);
		expect(validationError.message).toContain("name - String must contain at least 3 character(s)");
		expect(validationError.message).toContain("email - Invalid email");
		expect(validationError.statusCode).toBe(400);
		expect(validationError.cause).toBe(result.error);
	});

	it("should respect custom options", () => {
		const schema = z.string();
		const result = schema.safeParse(123);

		expect(result.success).toBe(false);
		if (result.success) return; // type guard

		const validationError = fromZodError(result.error, { statusCode: 422, isOperational: false });

		expect(validationError.statusCode).toBe(422);
		expect(validationError.isOperational).toBe(false);
	});
});
