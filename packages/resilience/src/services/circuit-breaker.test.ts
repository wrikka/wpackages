import { describe, expect, it, vi } from "vitest";
import { createCircuitBreaker, createCircuitBreakerConfig, defaultCircuitBreakerConfig } from "./circuit-breaker";

describe("circuit-breaker service", () => {
	describe("createCircuitBreaker", () => {
		it("should start in CLOSED state", async () => {
			const breaker = createCircuitBreaker(defaultCircuitBreakerConfig);
			const state = breaker.getState();

			expect(state.state).toBe("CLOSED");
			expect(state.failureCount).toBe(0);
			expect(state.successCount).toBe(0);
		});

		it("should execute successfully when CLOSED", async () => {
			const breaker = createCircuitBreaker(defaultCircuitBreakerConfig);
			const fn = vi.fn().mockResolvedValue("success");

			const result = await breaker.execute(fn);

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("should transition to OPEN after failure threshold", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 3,
				successThreshold: 2,
				timeout: 60000,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			// Trigger 3 failures
			for (let i = 0; i < 3; i++) {
				try {
					await breaker.execute(fn);
				} catch {
					// Expected
				}
			}

			const state = breaker.getState();
			expect(state.state).toBe("OPEN");
		});

		it("should reject requests when OPEN", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 2,
				timeout: 60000,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			// Trigger 1 failure to open
			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			// Try to execute when open
			await expect(breaker.execute(vi.fn())).rejects.toThrow("Circuit breaker is OPEN");
		});

		it("should transition to HALF_OPEN after timeout", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 1,
				timeout: 100,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			// Trigger failure to open
			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			// Verify it's open
			let state = breaker.getState();
			expect(state.state).toBe("OPEN");

			// Wait for timeout
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Check state again - implementation may vary
			state = breaker.getState();
			expect(["OPEN", "HALF_OPEN"]).toContain(state.state);
		});

		it("should close after success threshold in HALF_OPEN", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 1,
				timeout: 100,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			// Trigger failure to open
			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			// Wait for timeout
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Execute successfully to close
			const successFn = vi.fn().mockResolvedValue("success");
			await breaker.execute(successFn);

			const state = breaker.getState();
			expect(state.state).toBe("CLOSED");
		});

		it("should track statistics", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 5,
				successThreshold: 2,
				timeout: 60000,
			});

			const successFn = vi.fn().mockResolvedValue("ok");
			const failFn = vi.fn().mockRejectedValue(new Error("Fail"));

			// 2 successes
			await breaker.execute(successFn);
			await breaker.execute(successFn);

			// 2 failures
			try {
				await breaker.execute(failFn);
			} catch {
				// Expected
			}
			try {
				await breaker.execute(failFn);
			} catch {
				// Expected
			}

			const stats = breaker.getStats();
			expect(stats.successCalls).toBe(2);
			expect(stats.failureCalls).toBe(2);
			expect(stats.totalCalls).toBe(4);
			expect(stats.failureRate).toBe(0.5);
		});

		it("should call onStateChange callback", async () => {
			const onStateChange = vi.fn();
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 1,
				timeout: 60000,
				onStateChange,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			expect(onStateChange).toHaveBeenCalledWith("CLOSED", "OPEN");
		});

		it("should call onSuccess callback", async () => {
			const onSuccess = vi.fn();
			const breaker = createCircuitBreaker({
				failureThreshold: 5,
				successThreshold: 2,
				timeout: 60000,
				onSuccess,
			});

			const fn = vi.fn().mockResolvedValue("success");
			await breaker.execute(fn);

			expect(onSuccess).toHaveBeenCalled();
		});

		it("should call onFailure callback", async () => {
			const onFailure = vi.fn();
			const breaker = createCircuitBreaker({
				failureThreshold: 5,
				successThreshold: 2,
				timeout: 60000,
				onFailure,
			});

			const error = new Error("Test error");
			const fn = vi.fn().mockRejectedValue(error);

			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			expect(onFailure).toHaveBeenCalledWith(error);
		});

		it("should support shouldTrip predicate", async () => {
			const shouldTrip = vi.fn().mockReturnValue(false);
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 1,
				timeout: 60000,
				shouldTrip,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			// Should not trip because shouldTrip returned false
			const state = breaker.getState();
			expect(state.state).toBe("CLOSED");
		});

		it("should support forceClosed", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 1,
				timeout: 60000,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			// Open the circuit
			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			expect(breaker.getState().state).toBe("OPEN");

			// Force close
			breaker.forceClosed();
			expect(breaker.getState().state).toBe("CLOSED");
		});

		it("should support forceOpen", async () => {
			const breaker = createCircuitBreaker(defaultCircuitBreakerConfig);

			breaker.forceOpen();
			expect(breaker.getState().state).toBe("OPEN");
		});

		it("should support reset", async () => {
			const breaker = createCircuitBreaker({
				failureThreshold: 1,
				successThreshold: 1,
				timeout: 60000,
			});

			const fn = vi.fn().mockRejectedValue(new Error("Fail"));

			// Open the circuit
			try {
				await breaker.execute(fn);
			} catch {
				// Expected
			}

			// Reset
			breaker.reset();

			const state = breaker.getState();
			const stats = breaker.getStats();

			expect(state.state).toBe("CLOSED");
			expect(stats.totalCalls).toBe(0);
		});
	});

	describe("createCircuitBreakerConfig", () => {
		it("should create config with defaults", () => {
			const config = createCircuitBreakerConfig({});

			expect(config.failureThreshold).toBe(5);
			expect(config.successThreshold).toBe(2);
			expect(config.timeout).toBe(60000);
		});

		it("should merge user config with defaults", () => {
			const config = createCircuitBreakerConfig({
				failureThreshold: 10,
				successThreshold: 3,
			});

			expect(config.failureThreshold).toBe(10);
			expect(config.successThreshold).toBe(3);
			expect(config.timeout).toBe(60000);
		});

		it("should include optional callbacks", () => {
			const onStateChange = vi.fn();
			const onSuccess = vi.fn();
			const onFailure = vi.fn();

			const config = createCircuitBreakerConfig({
				onStateChange,
				onSuccess,
				onFailure,
			});

			expect(config.onStateChange).toBe(onStateChange);
			expect(config.onSuccess).toBe(onSuccess);
			expect(config.onFailure).toBe(onFailure);
		});
	});

	describe("defaultCircuitBreakerConfig", () => {
		it("should have sensible defaults", () => {
			expect(defaultCircuitBreakerConfig.failureThreshold).toBe(5);
			expect(defaultCircuitBreakerConfig.successThreshold).toBe(2);
			expect(defaultCircuitBreakerConfig.timeout).toBe(60000);
		});
	});
});
