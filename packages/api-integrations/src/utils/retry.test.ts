import { describe, expect, it } from "vitest";
import { HTTP_STATUS } from "../constant";
import { buildRetryConfig, calculateRetryDelay, isRetryableStatus, shouldRetry } from "./retry";

describe("retry utils", () => {
	describe("calculateRetryDelay", () => {
		it("should calculate exponential backoff delay", () => {
			const delay1 = calculateRetryDelay(1);
			const delay2 = calculateRetryDelay(2);
			const delay3 = calculateRetryDelay(3);

			// First retry should be around initialDelay (1000ms)
			expect(delay1).toBeGreaterThanOrEqual(1000);
			expect(delay1).toBeLessThanOrEqual(1200);

			// Second retry should be around initialDelay * 2 (2000ms)
			expect(delay2).toBeGreaterThanOrEqual(2000);
			expect(delay2).toBeLessThanOrEqual(2400);

			// Third retry should be around initialDelay * 4 (4000ms)
			expect(delay3).toBeGreaterThanOrEqual(4000);
			expect(delay3).toBeLessThanOrEqual(4800);
		});

		it("should cap delay at maxDelay", () => {
			const delay = calculateRetryDelay(10, 1000, 2, 5000);
			expect(delay).toBeLessThanOrEqual(6000); // maxDelay + 20% jitter
		});
	});

	describe("isRetryableStatus", () => {
		it("should return true for retryable status codes", () => {
			expect(isRetryableStatus(HTTP_STATUS.TOO_MANY_REQUESTS)).toBe(true);
			expect(isRetryableStatus(HTTP_STATUS.SERVICE_UNAVAILABLE)).toBe(true);
			expect(isRetryableStatus(HTTP_STATUS.GATEWAY_TIMEOUT)).toBe(true);
		});

		it("should return false for non-retryable status codes", () => {
			expect(isRetryableStatus(HTTP_STATUS.BAD_REQUEST)).toBe(false);
			expect(isRetryableStatus(HTTP_STATUS.UNAUTHORIZED)).toBe(false);
			expect(isRetryableStatus(HTTP_STATUS.NOT_FOUND)).toBe(false);
		});

		it("should support custom retryable statuses", () => {
			expect(isRetryableStatus(HTTP_STATUS.BAD_REQUEST, [400, 500])).toBe(true);
		});
	});

	describe("shouldRetry", () => {
		it("should return true when attempts are below max", () => {
			expect(shouldRetry(1, 3)).toBe(true);
			expect(shouldRetry(2, 3)).toBe(true);
		});

		it("should return false when attempts reach max", () => {
			expect(shouldRetry(3, 3)).toBe(false);
			expect(shouldRetry(4, 3)).toBe(false);
		});
	});

	describe("buildRetryConfig", () => {
		it("should use defaults for missing values", () => {
			const config = buildRetryConfig();
			expect(config.maxAttempts).toBe(3);
			expect(config.initialDelay).toBe(1000);
		});

		it("should override defaults with provided values", () => {
			const config = buildRetryConfig({ maxAttempts: 5 });
			expect(config.maxAttempts).toBe(5);
			expect(config.initialDelay).toBe(1000); // Still uses default
		});
	});
});
