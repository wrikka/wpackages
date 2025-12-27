import { describe, expect, it } from "vitest";
import { createFixedWindow, createRateLimiter } from "./rate-limiter";

describe("rate-limiter service", () => {
	describe("createRateLimiter", () => {
		it("should create rate limiter with fixed window algorithm", () => {
			const limiter = createRateLimiter({
				algorithm: "fixed-window",
				maxRequests: 5,
				windowMs: 1000,
			});

			expect(limiter).toBeDefined();
		});

		it("should allow requests within limit", async () => {
			const limiter = createRateLimiter({
				algorithm: "fixed-window",
				maxRequests: 3,
				windowMs: 1000,
			});

			const result1 = await limiter.check("test-key");
			const result2 = await limiter.check("test-key");
			const result3 = await limiter.check("test-key");

			expect(result1.allowed).toBe(true);
			expect(result2.allowed).toBe(true);
			expect(result3.allowed).toBe(true);
		});

		it("should reject requests exceeding limit", async () => {
			const limiter = createRateLimiter({
				algorithm: "fixed-window",
				maxRequests: 2,
				windowMs: 1000,
			});

			await limiter.check("test-key");
			await limiter.check("test-key");
			const result3 = await limiter.check("test-key");

			expect(result3.allowed).toBe(false);
		});

		it("should reset after window expires", async () => {
			const limiter = createRateLimiter({
				algorithm: "fixed-window",
				maxRequests: 1,
				windowMs: 100,
			});

			const result1 = await limiter.check("test-key");
			expect(result1.allowed).toBe(true);

			const result2 = await limiter.check("test-key");
			expect(result2.allowed).toBe(false);

			// Wait for window to expire
			await new Promise((resolve) => setTimeout(resolve, 150));

			const result3 = await limiter.check("test-key");
			expect(result3.allowed).toBe(true);
		});

		it("should track remaining requests", async () => {
			const limiter = createRateLimiter({
				algorithm: "fixed-window",
				maxRequests: 3,
				windowMs: 1000,
			});

			const result1 = await limiter.check("test-key");
			expect(result1.remaining).toBe(2);

			const result2 = await limiter.check("test-key");
			expect(result2.remaining).toBe(1);

			const result3 = await limiter.check("test-key");
			expect(result3.remaining).toBe(0);
		});

		it("should track reset time", async () => {
			const limiter = createRateLimiter({
				algorithm: "fixed-window",
				maxRequests: 1,
				windowMs: 1000,
			});

			const result = await limiter.check("test-key");
			expect(result.resetIn).toBeDefined();
			expect(result.resetIn).toBeGreaterThan(0);
		});
	});

	describe("createFixedWindow", () => {
		it("should create fixed window rate limiter", () => {
			const limiter = createFixedWindow({
				maxRequests: 5,
				windowMs: 1000,
			});

			expect(limiter).toBeDefined();
		});

		it("should allow requests within window", async () => {
			const limiter = createFixedWindow({
				maxRequests: 3,
				windowMs: 1000,
			});

			for (let i = 0; i < 3; i++) {
				const result = await limiter.check("test-key");
				expect(result.allowed).toBe(true);
			}
		});

		it("should reject requests exceeding limit", async () => {
			const limiter = createFixedWindow({
				maxRequests: 2,
				windowMs: 1000,
			});

			await limiter.check("test-key");
			await limiter.check("test-key");

			const result = await limiter.check("test-key");
			expect(result.allowed).toBe(false);
		});

		it("should reset on new window", async () => {
			const limiter = createFixedWindow({
				maxRequests: 1,
				windowMs: 100,
			});

			const result1 = await limiter.check("test-key");
			expect(result1.allowed).toBe(true);

			const result2 = await limiter.check("test-key");
			expect(result2.allowed).toBe(false);

			await new Promise((resolve) => setTimeout(resolve, 150));

			const result3 = await limiter.check("test-key");
			expect(result3.allowed).toBe(true);
		});
	});
});
