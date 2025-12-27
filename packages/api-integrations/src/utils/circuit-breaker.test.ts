import { beforeEach, describe, expect, it } from "vitest";
import {
	calculateHealthScore,
	type CircuitBreaker,
	createCircuitBreaker,
	executeWithCircuitBreaker,
} from "./circuit-breaker";

describe("circuit-breaker", () => {
	let breaker: CircuitBreaker;

	beforeEach(() => {
		breaker = createCircuitBreaker({
			failureThreshold: 3,
			successThreshold: 2,
			timeout: 1000,
		});
	});

	describe("CircuitBreaker", () => {
		it("should start in closed state", () => {
			expect(breaker.getState()).toBe("closed");
		});

		it("should allow requests when closed", () => {
			expect(breaker.isAllowed()).toBe(true);
		});

		it("should open after failure threshold", () => {
			breaker.recordFailure();
			breaker.recordFailure();
			breaker.recordFailure();
			expect(breaker.getState()).toBe("open");
		});

		it("should not allow requests when open", () => {
			breaker.forceOpen();
			expect(breaker.isAllowed()).toBe(false);
		});

		it("should record successes", () => {
			breaker.recordSuccess();
			const stats = breaker.getStats();
			expect(stats.successes).toBe(1);
		});

		it("should reset counters", () => {
			breaker.recordFailure();
			breaker.reset();
			const stats = breaker.getStats();
			expect(stats.failures).toBe(0);
		});
	});

	describe("executeWithCircuitBreaker", () => {
		it("should execute function when allowed", async () => {
			const fn = async () => "success";
			const result = await executeWithCircuitBreaker(breaker, fn);
			expect(result).toBe("success");
		});

		it("should throw when circuit is open", async () => {
			breaker.forceOpen();
			const fn = async () => "success";
			await expect(executeWithCircuitBreaker(breaker, fn)).rejects.toThrow("Circuit breaker is open");
		});
	});

	describe("calculateHealthScore", () => {
		it("should return 100 for no requests", () => {
			const stats = breaker.getStats();
			expect(calculateHealthScore(stats)).toBe(100);
		});

		it("should calculate score based on success rate", () => {
			breaker.recordSuccess();
			breaker.recordSuccess();
			breaker.recordFailure();
			const stats = breaker.getStats();
			const score = calculateHealthScore(stats);
			expect(score).toBeGreaterThan(0);
			expect(score).toBeLessThanOrEqual(100);
		});
	});
});
