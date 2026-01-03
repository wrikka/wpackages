import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { NotificationError } from "../../src/types";
import { validatePhoneNumber } from "../../src/utils/validation";

describe("Validation - validatePhoneNumber", () => {
	it("should validate international phone number", async () => {
		const result = await Effect.runPromise(validatePhoneNumber("+66812345678"));
		expect(result).toBe(true);
	});

	it("should validate US phone number", async () => {
		const result = await Effect.runPromise(validatePhoneNumber("+11234567890"));
		expect(result).toBe(true);
	});

	it("should fail on phone without country code", async () => {
		const result = await Effect.runPromise(
			Effect.either(validatePhoneNumber("0123456789")),
		);

		expect(result._tag).toBe("Left");
		const error = (result as { _tag: "Left"; left: NotificationError }).left;
		expect(error).toBeInstanceOf(NotificationError);
		expect(error.reason).toBe("InvalidRecipient");
	});

	it("should fail on phone with letters", async () => {
		const result = await Effect.runPromise(
			Effect.either(validatePhoneNumber("+66abc123456")),
		);

		expect(result._tag).toBe("Left");
		const error = (result as { _tag: "Left"; left: NotificationError }).left;
		expect(error).toBeInstanceOf(NotificationError);
		expect(error.reason).toBe("InvalidRecipient");
	});

	it("should fail on empty phone", async () => {
		const result = await Effect.runPromise(
			Effect.either(validatePhoneNumber("")),
		);

		expect(result._tag).toBe("Left");
	});

	it("should fail on phone with spaces", async () => {
		const result = await Effect.runPromise(
			Effect.either(validatePhoneNumber("+66 81 234 5678")),
		);

		expect(result._tag).toBe("Left");
	});
});
