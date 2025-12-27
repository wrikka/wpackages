import { describe, it, expect } from "vitest";
import {
	calculateBackoffDelay,
	calculateBackoffWithJitter,
	calculateLinearBackoff,
	shouldRetry,
	createRetryAttempts,
	getRetryMetadata,
	isRetryableError,
	DEFAULT_RETRY_CONFIG,
	type RetryConfig,
} from "./retry-strategy";

describe("retry-strategy", () => {
	const config: RetryConfig = {
		maxAttempts: 3,
		initialDelayMs: 1000,
		maxDelayMs: 10000,
		backoffMultiplier: 2,
	};

	describe("calculateBackoffDelay", () => {
		it("should calculate exponential backoff", () => {
			expect(calculateBackoffDelay(1, config)).toBe(1000);
			expect(calculateBackoffDelay(2, config)).toBe(2000);
			expect(calculateBackoffDelay(3, config)).toBe(4000);
		});

		it("should respect max delay", () => {
			const result = calculateBackoffDelay(10, config);
			expect(result).toBeLessThanOrEqual(config.maxDelayMs);
		});
	});

	describe("calculateBackoffWithJitter", () => {
		it("should add jitter to backoff delay", () => {
			const delay = calculateBackoffWithJitter(1, config);
			expect(delay).toBeGreaterThanOrEqual(1000);
			expect(delay).toBeLessThanOrEqual(1100); // 10% jitter
		});
	});

	describe("calculateLinearBackoff", () => {
		it("should calculate linear backoff", () => {
			expect(calculateLinearBackoff(1, config)).toBe(1000);
			expect(calculateLinearBackoff(2, config)).toBe(2000);
			expect(calculateLinearBackoff(3, config)).toBe(3000);
		});
	});

	describe("shouldRetry", () => {
		it("should return false if max attempts reached", () => {
			expect(shouldRetry(new Error("timeout"), 3, config)).toBe(false);
		});

		it("should return true for retryable errors", () => {
			expect(shouldRetry(new Error("timeout"), 1, config)).toBe(true);
			expect(shouldRetry(new Error("network error"), 1, config)).toBe(true);
		});

		it("should return false for non-retryable errors", () => {
			expect(shouldRetry(new Error("invalid input"), 1, config)).toBe(false);
		});
	});

	describe("createRetryAttempts", () => {
		it("should create array of retry attempts", () => {
			const attempts = createRetryAttempts(config);
			expect(attempts).toEqual([1, 2, 3]);
		});
	});

	describe("getRetryMetadata", () => {
		it("should return retry metadata", () => {
			const metadata = getRetryMetadata(2, config);
			expect(metadata).toEqual({
				attempt: 2,
				maxAttempts: 3,
				delay: 2000,
				isLastAttempt: false,
			});
		});

		it("should mark last attempt", () => {
			const metadata = getRetryMetadata(3, config);
			expect(metadata.isLastAttempt).toBe(true);
		});
	});

	describe("isRetryableError", () => {
		it("should identify retryable errors", () => {
			expect(isRetryableError(new Error("timeout"))).toBe(true);
			expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true);
			expect(isRetryableError(new Error("503 Service Unavailable"))).toBe(true);
		});

		it("should identify non-retryable errors", () => {
			expect(isRetryableError(new Error("invalid input"))).toBe(false);
			expect(isRetryableError(new Error("404 not found"))).toBe(false);
		});

		it("should handle non-error objects", () => {
			expect(isRetryableError("string error")).toBe(false);
			expect(isRetryableError(null)).toBe(false);
		});
	});

	describe("DEFAULT_RETRY_CONFIG", () => {
		it("should have sensible defaults", () => {
			expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3);
			expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBe(1000);
			expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
		});
	});
});
