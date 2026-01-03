/**
 * Tests for advanced caching utilities
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutoKeyCache, createRetryCache, createTTLCache } from "./advanced";

describe("Advanced Caching Utilities", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("createAutoKeyCache", () => {
		it("should automatically generate keys and cache results", () => {
			let callCount = 0;
			const fn = (x: number, y: number) => {
				callCount++;
				return x + y;
			};

			const cachedFn = createAutoKeyCache(fn);

			expect(cachedFn(1, 2)).toBe(3);
			expect(callCount).toBe(1);

			expect(cachedFn(1, 2)).toBe(3);
			expect(callCount).toBe(1); // Should not increment

			expect(cachedFn(2, 3)).toBe(5);
			expect(callCount).toBe(2); // Should increment for new args
		});
	});

	describe("createTTLCache", () => {
		it("should cache results with custom TTL", () => {
			let callCount = 0;
			const fn = (x: number) => {
				callCount++;
				return x * 2;
			};

			// TTL based on result value (100ms per unit)
			const cachedFn = createTTLCache(fn, (result) => result * 100);

			expect(cachedFn(2)).toBe(4); // TTL = 400ms
			expect(callCount).toBe(1);

			// Should be cached
			expect(cachedFn(2)).toBe(4);
			expect(callCount).toBe(1);

			// Wait for TTL to expire
			vi.advanceTimersByTime(500);
			expect(cachedFn(2)).toBe(4);
			expect(callCount).toBe(2); // Should increment after TTL
		});
	});

	describe("createRetryCache", () => {
		it("should retry failed operations and cache successful results", () => {
			let callCount = 0;
			const fn = (x: number) => {
				callCount++;
				if (callCount <= 2) {
					throw new Error("Temporary error");
				}
				return x * 2;
			};

			const cachedFn = createRetryCache(fn, 3);

			// First two calls should fail, third should succeed
			const result = cachedFn(5);
			expect(result).toBe(10);
			expect(callCount).toBe(3);

			// Should be cached now
			const cachedResult = cachedFn(5);
			expect(cachedResult).toBe(10);
			expect(callCount).toBe(3); // Should not increment
		});

		it("should throw error after max retries exceeded", () => {
			const fn = () => {
				throw new Error("Persistent error");
			};
			const cachedFn = createRetryCache(fn, 2);

			expect(() => cachedFn(5)).toThrow("Max retries exceeded");
		});
	});
});
