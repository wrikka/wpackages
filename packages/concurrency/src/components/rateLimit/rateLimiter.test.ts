import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimiter";

describe("RateLimiter", () => {
	it("should limit requests according to rate limit", async () => {
		const limiter = createRateLimiter({ maxRequests: 2, interval: 100 });

		// First two requests should pass immediately
		const start = Date.now();
		await limiter.wait();
		await limiter.wait();
		const afterTwo = Date.now();

		// Third request should wait
		await limiter.wait();
		const afterThree = Date.now();

		// First two should be immediate (less than 10ms)
		expect(afterTwo - start).toBeLessThan(10);
		// Third should wait (more than 90ms since interval is 100ms)
		expect(afterThree - afterTwo).toBeGreaterThanOrEqual(90);
	});

	it("should reset after interval", async () => {
		const limiter = createRateLimiter({ maxRequests: 2, interval: 50 });

		// Use all requests
		await limiter.wait();
		await limiter.wait();

		// Wait for reset
		await new Promise(resolve => setTimeout(resolve, 60));

		// Should allow requests again immediately
		const start = Date.now();
		await limiter.wait();
		await limiter.wait();
		const end = Date.now();

		// Should be immediate again
		expect(end - start).toBeLessThan(10);
	});

	it("should provide correct stats", async () => {
		const limiter = createRateLimiter({ maxRequests: 3, interval: 1000 });

		// Check initial stats
		const stats1 = limiter.getStats();
		expect(stats1.remaining).toBe(3);
		expect(stats1.resetTime).toBeGreaterThan(Date.now());

		// Use one request
		await limiter.wait();

		// Check stats after one request
		const stats2 = limiter.getStats();
		expect(stats2.remaining).toBe(2);

		// Use remaining requests
		await limiter.wait();
		await limiter.wait();

		// Check stats when no requests remaining
		const stats3 = limiter.getStats();
		expect(stats3.remaining).toBe(0);
	});

	it("should reset manually", async () => {
		const limiter = createRateLimiter({ maxRequests: 2, interval: 1000 });

		// Use all requests
		await limiter.wait();
		await limiter.wait();

		// Check no remaining requests
		const stats1 = limiter.getStats();
		expect(stats1.remaining).toBe(0);

		// Reset manually
		limiter.reset();

		// Check reset worked
		const stats2 = limiter.getStats();
		expect(stats2.remaining).toBe(2);

		// Should allow requests again
		const start = Date.now();
		await limiter.wait();
		const end = Date.now();

		// Should be immediate
		expect(end - start).toBeLessThan(10);
	});
});
