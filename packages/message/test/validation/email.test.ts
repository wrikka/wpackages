import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { NotificationError } from "../../src/types";
import { validateEmail } from "../../src/utils/validation";

describe("Validation - validateEmail", () => {
	it("should validate correct email", async () => {
		const result = await Effect.runPromise(validateEmail("test@example.com"));
		expect(result).toBe(true);
	});

	it("should validate email with subdomain", async () => {
		const result = await Effect.runPromise(
			validateEmail("user@mail.example.com"),
		);
		expect(result).toBe(true);
	});

	it("should fail on invalid email without @", async () => {
		const result = await Effect.runPromise(
			Effect.either(validateEmail("invalid-email")),
		);

		expect(result._tag).toBe("Left");
		const error = (result as { _tag: "Left"; left: NotificationError }).left;
		expect(error).toBeInstanceOf(NotificationError);
		expect(error.reason).toBe("InvalidRecipient");
	});

	it("should fail on invalid email without domain", async () => {
		const result = await Effect.runPromise(
			Effect.either(validateEmail("test@")),
		);

		expect(result._tag).toBe("Left");
	});

	it("should fail on empty email", async () => {
		const result = await Effect.runPromise(Effect.either(validateEmail("")));

		expect(result._tag).toBe("Left");
	});

	it("should fail on email with spaces", async () => {
		const result = await Effect.runPromise(
			Effect.either(validateEmail("test @example.com")),
		);

		expect(result._tag).toBe("Left");
	});
});
