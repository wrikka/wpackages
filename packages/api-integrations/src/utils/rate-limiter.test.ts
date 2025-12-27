import { beforeEach, describe, expect, it } from "vitest";
import { calculateWaitTime, createRateLimiter, isRateLimited, parseRateLimitHeaders } from "./rate-limiter";

describe("rate-limiter", () => {
	describe("FixedWindowRateLimiter", () => {
		let limiter: ReturnType<typeof createRateLimiter>;

		beforeEach(() => {
			limiter = createRateLimiter({
				maxRequests: 3,
				windowMs: 1000,
				strategy: "fixed",
			});
		});

		it("should allow requests within limit", () => {
			expect(limiter.isAllowed()).toBe(true);
			limiter.record();
			limiter.record();
			expect(limiter.isAllowed()).toBe(true);
		});

		it("should block requests after limit", () => {
			limiter.record();
			limiter.record();
			limiter.record();
			expect(limiter.isAllowed()).toBe(false);
		});

		it("should track remaining requests", () => {
			const state = limiter.getState();
			expect(state.remaining).toBe(3);
			limiter.record();
			expect(limiter.getState().remaining).toBe(2);
		});
	});

	describe("SlidingWindowRateLimiter", () => {
		let limiter: ReturnType<typeof createRateLimiter>;

		beforeEach(() => {
			limiter = createRateLimiter({
				maxRequests: 5,
				windowMs: 1000,
				strategy: "sliding",
			});
		});

		it("should allow requests within limit", () => {
			expect(limiter.isAllowed()).toBe(true);
		});

		it("should block after limit", () => {
			for (let i = 0; i < 5; i++) {
				limiter.record();
			}
			expect(limiter.isAllowed()).toBe(false);
		});
	});

	describe("parseRateLimitHeaders", () => {
		it("should parse rate limit headers", () => {
			const headers = {
				"x-ratelimit-limit": "100",
				"x-ratelimit-remaining": "95",
				"x-ratelimit-reset": "1234567890",
			};
			const result = parseRateLimitHeaders(headers);
			expect(result.limit).toBe(100);
			expect(result.remaining).toBe(95);
		});

		it("should handle missing headers", () => {
			const result = parseRateLimitHeaders({});
			expect(result.limit).toBeUndefined();
		});
	});

	describe("isRateLimited", () => {
		it("should detect rate limiting", () => {
			expect(isRateLimited({ remaining: 0 })).toBe(true);
			expect(isRateLimited({ remaining: 10 })).toBe(false);
		});
	});

	describe("calculateWaitTime", () => {
		it("should calculate wait time from retryAfter", () => {
			const wait = calculateWaitTime({ retryAfter: 60 });
			expect(wait).toBe(60000);
		});

		it("should return 0 for no limit info", () => {
			const wait = calculateWaitTime({});
			expect(wait).toBe(0);
		});
	});
});
