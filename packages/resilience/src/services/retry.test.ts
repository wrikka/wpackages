import { describe, expect, it, vi } from "vitest";
import { createRetryPolicy, defaultRetryConfig, retry } from "./retry";

describe("retry service", () => {
	describe("retry function", () => {
		it("should succeed on first attempt", async () => {
			const fn = vi.fn().mockResolvedValue(42);
			const result = await retry(fn);

			expect(result.success).toBe(true);
			expect(result.value).toBe(42);
			expect(result.attempts).toBe(1);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("should retry on failure and eventually succeed", async () => {
			const fn = vi
				.fn()
				.mockRejectedValueOnce(new Error("Attempt 1"))
				.mockRejectedValueOnce(new Error("Attempt 2"))
				.mockResolvedValueOnce(42);

			const result = await retry(fn, { maxAttempts: 3 });

			expect(result.success).toBe(true);
			expect(result.value).toBe(42);
			expect(result.attempts).toBe(3);
			expect(fn).toHaveBeenCalledTimes(3);
		});

		it("should fail after max attempts", async () => {
			const fn = vi.fn().mockRejectedValue(new Error("Always fails"));
			const result = await retry(fn, { maxAttempts: 3 });

			expect(result.success).toBe(false);
			expect(result.error?.message).toBe("Always fails");
			expect(result.attempts).toBe(3);
			expect(fn).toHaveBeenCalledTimes(3);
		});

		it("should use exponential backoff by default", async () => {
			const fn = vi.fn().mockRejectedValue(new Error("Fail"));
			const startTime = Date.now();

			await retry(fn, { maxAttempts: 3, baseDelay: 10 });

			const duration = Date.now() - startTime;
			// Should have delays: 10ms (2^0), 20ms (2^1) = ~30ms minimum
			expect(duration).toBeGreaterThanOrEqual(20);
		});

		it("should use linear backoff when specified", async () => {
			const fn = vi.fn().mockRejectedValue(new Error("Fail"));
			const startTime = Date.now();

			await retry(fn, {
				maxAttempts: 3,
				baseDelay: 10,
				strategy: "linear",
			});

			const duration = Date.now() - startTime;
			// Should have delays: 10ms, 20ms = ~30ms minimum
			expect(duration).toBeGreaterThanOrEqual(20);
		});

		it("should use fixed backoff when specified", async () => {
			const fn = vi.fn().mockRejectedValue(new Error("Fail"));
			const startTime = Date.now();

			await retry(fn, {
				maxAttempts: 3,
				baseDelay: 10,
				strategy: "fixed",
			});

			const duration = Date.now() - startTime;
			// Should have delays: 10ms, 10ms = ~20ms minimum
			expect(duration).toBeGreaterThanOrEqual(15);
		});

		it("should respect maxDelay", async () => {
			const fn = vi.fn().mockRejectedValue(new Error("Fail"));
			const startTime = Date.now();

			await retry(fn, {
				maxAttempts: 3,
				baseDelay: 1000,
				maxDelay: 50,
				strategy: "exponential",
			});

			const duration = Date.now() - startTime;
			// Should be capped at maxDelay
			expect(duration).toBeLessThan(200);
		});

		it("should call shouldRetry predicate", async () => {
			const shouldRetry = vi.fn().mockReturnValue(false);
			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			const result = await retry(fn, {
				maxAttempts: 3,
				shouldRetry,
			});

			expect(result.success).toBe(false);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(shouldRetry).toHaveBeenCalledTimes(1);
		});

		it("should call onRetry callback", async () => {
			const onRetry = vi.fn();
			const fn = vi
				.fn()
				.mockRejectedValueOnce(new Error("Fail"))
				.mockResolvedValueOnce(42);

			await retry(fn, {
				maxAttempts: 2,
				baseDelay: 10,
				onRetry,
			});

			expect(onRetry).toHaveBeenCalledTimes(1);
			expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
		});

		it("should track total duration", async () => {
			const fn = vi
				.fn()
				.mockRejectedValueOnce(new Error("Fail"))
				.mockResolvedValueOnce(42);

			const result = await retry(fn, {
				maxAttempts: 2,
				baseDelay: 10,
			});

			expect(result.totalDuration).toBeGreaterThanOrEqual(10);
		});
	});

	describe("createRetryPolicy", () => {
		it("should create retry policy with defaults", () => {
			const policy = createRetryPolicy({});

			expect(policy.enabled).toBe(true);
			expect(policy.maxRetries).toBe(3);
			expect(policy.retryDelay).toBe(1000);
			expect(policy.exponentialBackoff).toBe(true);
			expect(policy.maxDelay).toBe(30000);
		});

		it("should merge user config with defaults", () => {
			const policy = createRetryPolicy({
				maxRetries: 5,
				retryDelay: 500,
			});

			expect(policy.maxRetries).toBe(5);
			expect(policy.retryDelay).toBe(500);
			expect(policy.exponentialBackoff).toBe(true);
		});
	});

	describe("defaultRetryConfig", () => {
		it("should have sensible defaults", () => {
			expect(defaultRetryConfig.enabled).toBe(true);
			expect(defaultRetryConfig.maxRetries).toBe(3);
			expect(defaultRetryConfig.retryDelay).toBe(1000);
			expect(defaultRetryConfig.exponentialBackoff).toBe(true);
			expect(defaultRetryConfig.maxDelay).toBe(30000);
		});
	});
});
