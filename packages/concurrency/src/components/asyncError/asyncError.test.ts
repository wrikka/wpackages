import { describe, expect, it, vi } from "vitest";
import { allSettledSafe, retryAsync, safeAsync, withFallback, withTimeout } from "./asyncError";

describe("Async Error Handling Utilities", () => {
	describe("safeAsync", () => {
		it("should return success result for successful async function", async () => {
			const fn = async () => "success";
			const result = await safeAsync(fn);

			expect(result).toEqual({ success: true, value: "success" });
		});

		it("should return error result for failing async function", async () => {
			const fn = async () => {
				throw new Error("fail");
			};
			const result = await safeAsync(fn);

			expect(result).toEqual({ success: false, error: expect.any(Error) });
			expect(result.success).toBe(false);
			expect(result).toHaveProperty("error");
			expect(result.error).toBeInstanceOf(Error);
			expect(result.error.message).toBe("fail");
		});
	});

	describe("retryAsync", () => {
		it("should return result on first success", async () => {
			const fn = vi.fn(async () => "success");
			const result = await retryAsync(fn);

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("should retry on failure and eventually succeed", async () => {
			let attempts = 0;
			const fn = vi.fn(async () => {
				attempts++;
				if (attempts < 3) throw new Error("fail");
				return "success";
			});

			const result = await retryAsync(fn, { maxAttempts: 5, delay: 10 });

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(3);
		});

		it("should throw error after max attempts", async () => {
			const fn = vi.fn(async () => {
				throw new Error("always fails");
			});

			await expect(retryAsync(fn, { maxAttempts: 2, delay: 10 }))
				.rejects.toThrow("always fails");
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it("should apply exponential backoff", async () => {
			let attempts = 0;
			const fn = vi.fn(async () => {
				attempts++;
				if (attempts < 3) throw new Error("fail");
				return "success";
			});

			const start = Date.now();
			await retryAsync(fn, { maxAttempts: 3, delay: 50, backoff: "exponential" });
			const end = Date.now();

			// Should take longer due to exponential backoff
			expect(end - start).toBeGreaterThan(140); // 50 + 100 = 150ms minimum
		});
	});

	describe("withFallback", () => {
		it("should return result for successful function", async () => {
			const fn = async () => "success";
			const result = await withFallback(fn, "fallback");

			expect(result).toBe("success");
		});

		it("should return fallback for failing function", async () => {
			const fn = async () => {
				throw new Error("fail");
			};
			const result = await withFallback(fn, "fallback");

			expect(result).toBe("fallback");
		});

		it("should call onError callback on failure", async () => {
			const onError = vi.fn();
			const fn = async () => {
				throw new Error("fail");
			};

			await withFallback(fn, "fallback", { onError });

			expect(onError).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe("allSettledSafe", () => {
		it("should handle mixed success and failure", async () => {
			const fns = [
				async () => "success1",
				async () => {
					throw new Error("fail");
				},
				async () => "success2",
			];

			const results = await allSettledSafe(fns);

			expect(results).toHaveLength(3);
			expect(results[0]).toEqual({ success: true, value: "success1" });
			expect(results[1]).toEqual({ success: false, error: expect.any(Error) });
			expect(results[2]).toEqual({ success: true, value: "success2" });
		});
	});

	describe("withTimeout", () => {
		it("should return result if completes in time", async () => {
			const fn = async () => {
				await new Promise(resolve => setTimeout(resolve, 50));
				return "success";
			};

			const result = await withTimeout(fn, 100);
			expect(result).toBe("success");
		});

		it("should throw timeout error if takes too long", async () => {
			const fn = async () => {
				await new Promise(resolve => setTimeout(resolve, 100));
				return "success";
			};

			await expect(withTimeout(fn, 50))
				.rejects.toThrow("Timeout after 50ms");
		});
	});
});
