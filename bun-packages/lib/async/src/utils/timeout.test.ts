import { describe, expect, it } from "vitest";
import { TimeoutError, withTimeout } from "./timeout";

describe("withTimeout", () => {
	it("should resolve if promise resolves before timeout", async () => {
		const promise = Promise.resolve("result");
		const result = await withTimeout(promise, 1000);
		expect(result).toBe("result");
	});

	it("should throw TimeoutError if promise takes too long", async () => {
		const promise = new Promise((resolve) => setTimeout(resolve, 1000));
		await expect(withTimeout(promise, 10)).rejects.toThrow(TimeoutError);
	});

	it("should use custom timeout message", async () => {
		const promise = new Promise((resolve) => setTimeout(resolve, 1000));
		await expect(withTimeout(promise, 10, { message: "Custom timeout" })).rejects.toThrow(
			"Custom timeout",
		);
	});

	it("should reject for negative ms", async () => {
		await expect(withTimeout(Promise.resolve(), -1)).rejects.toThrow(RangeError);
	});
});
