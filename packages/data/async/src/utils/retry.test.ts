import { describe, expect, it, vi } from "vitest";
import { retry } from "./retry";

describe("retry", () => {
	it("should return result on first successful attempt", async () => {
		const fn = vi.fn().mockResolvedValue("success");
		const result = await retry(fn, { maxAttempts: 3, delay: 10 });
		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("should retry on failure", async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new Error("fail 1"))
			.mockRejectedValueOnce(new Error("fail 2"))
			.mockResolvedValue("success");
		const onRetry = vi.fn();
		const result = await retry(fn, { maxAttempts: 3, delay: 10, onRetry });
		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(3);
		expect(onRetry).toHaveBeenCalledTimes(2);
	});

	it("should throw after max attempts", async () => {
		const fn = vi.fn().mockRejectedValue(new Error("always fails"));
		await expect(retry(fn, { maxAttempts: 3, delay: 10 })).rejects.toThrow("always fails");
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("should abort when signal is aborted", async () => {
		const controller = new AbortController();
		controller.abort();
		const fn = vi.fn().mockResolvedValue("success");
		await expect(retry(fn, { maxAttempts: 3, delay: 10, signal: controller.signal })).rejects.toThrow();
	});
});
