import { describe, expect, it, vi } from "vitest";
import { debounce, sleep, throttle } from "./async.utils";

describe("async.utils", () => {
	describe("sleep", () => {
		it("should wait for specified milliseconds", async () => {
			const start = Date.now();
			await sleep(100);
			const elapsed = Date.now() - start;
			expect(elapsed).toBeGreaterThanOrEqual(95);
		});

		it("should resolve after delay", async () => {
			const result = await sleep(10);
			expect(result).toBeUndefined();
		});
	});

	describe("debounce", () => {
		it("should delay function execution", async () => {
			const fn = vi.fn();
			const debounced = debounce(fn, 100);

			debounced();
			debounced();
			debounced();

			expect(fn).not.toHaveBeenCalled();

			await sleep(150);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("should pass arguments correctly", async () => {
			const fn = vi.fn();
			const debounced = debounce(fn, 50);

			debounced("test", 123);
			await sleep(100);

			expect(fn).toHaveBeenCalledWith("test", 123);
		});

		it("should cancel previous calls", async () => {
			const fn = vi.fn();
			const debounced = debounce(fn, 50);

			debounced("first");
			await sleep(25);
			debounced("second");
			await sleep(75);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith("second");
		});
	});

	describe("throttle", () => {
		it("should limit function execution rate", async () => {
			const fn = vi.fn();
			const throttled = throttle(fn, 100);

			throttled();
			throttled();
			throttled();

			expect(fn).toHaveBeenCalledTimes(1);

			await sleep(150);
			throttled();
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it("should pass arguments correctly", () => {
			const fn = vi.fn();
			const throttled = throttle(fn, 100);

			throttled("test", 123);
			expect(fn).toHaveBeenCalledWith("test", 123);
		});

		it("should not call during throttle period", async () => {
			const fn = vi.fn();
			const throttled = throttle(fn, 100);

			throttled();
			await sleep(50);
			throttled();
			await sleep(50);
			throttled();

			expect(fn).toHaveBeenCalledTimes(2);
		});
	});
});
