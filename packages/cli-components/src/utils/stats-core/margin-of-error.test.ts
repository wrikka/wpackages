import { describe, expect, it } from "vitest";
import { marginOfError, relativeMarginOfError } from "../stats-core";

describe("marginOfError", () => {
	it("should calculate margin of error with 95% confidence", () => {
		const result = marginOfError([1, 2, 3, 4, 5], 0.95);
		expect(result).toBeGreaterThan(0);
	});

	it("should calculate margin of error with 99% confidence", () => {
		const result = marginOfError([1, 2, 3, 4, 5], 0.99);
		expect(result).toBeGreaterThan(0);
	});

	it("should have larger margin with 99% vs 95%", () => {
		const moe95 = marginOfError([1, 2, 3, 4, 5], 0.95);
		const moe99 = marginOfError([1, 2, 3, 4, 5], 0.99);
		expect(moe99).toBeGreaterThan(moe95);
	});
});

describe("relativeMarginOfError", () => {
	it("should calculate relative margin of error as percentage", () => {
		const result = relativeMarginOfError([10, 11, 12, 13, 14], 0.95);
		expect(result).toBeGreaterThan(0);
		expect(result).toBeLessThan(100);
	});

	it("should return 0 for empty array", () => {
		expect(relativeMarginOfError([], 0.95)).toBe(0);
	});
});
