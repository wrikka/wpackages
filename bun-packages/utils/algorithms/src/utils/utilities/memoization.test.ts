import { describe, expect, it } from "vitest";
import { memoize } from "./memoization";

describe("memoization", () => {
	it("should cache function results", () => {
		let callCount = 0;
		const fn = (n: number): number => {
			callCount++;
			return n * n;
		};

		const memoizedFn = memoize(fn);

		memoizedFn(5);
		memoizedFn(5);
		memoizedFn(5);

		expect(callCount).toBe(1);
	});

	it("should handle different arguments", () => {
		let callCount = 0;
		const fn = (n: number): number => {
			callCount++;
			return n * n;
		};

		const memoizedFn = memoize(fn);

		memoizedFn(5);
		memoizedFn(10);
		memoizedFn(5);

		expect(callCount).toBe(2);
	});
});
