import { describe, expect, it, vi } from "vitest";
import { retry } from "./retry";

describe("retry", () => {
	it("should retry on failure", async () => {
		let attempts = 0;
		const fn = vi.fn(async () => {
			attempts++;
			if (attempts < 3) throw new Error("fail");
			return "success";
		});

		const result = await retry(fn, { delay: 10, maxAttempts: 3 });
		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("should throw after max attempts", async () => {
		const fn = vi.fn(async () => {
			throw new Error("always fails");
		});

		await expect(retry(fn, { delay: 10, maxAttempts: 2 })).rejects.toThrow(
			"always fails",
		);
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
