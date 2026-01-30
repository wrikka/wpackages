import { describe, expect, it } from "vitest";
import { max, min } from "../stats-core";

describe("min", () => {
	it("should find minimum value", () => {
		expect(min([5, 2, 8, 1, 9])).toBe(1);
	});

	it("should handle empty array", () => {
		expect(min([])).toBe(0);
	});

	it("should handle single value", () => {
		expect(min([42])).toBe(42);
	});

	it("should handle negative numbers", () => {
		expect(min([-5, -3, -1, -10])).toBe(-10);
	});
});

describe("max", () => {
	it("should find maximum value", () => {
		expect(max([5, 2, 8, 1, 9])).toBe(9);
	});

	it("should handle empty array", () => {
		expect(max([])).toBe(0);
	});

	it("should handle single value", () => {
		expect(max([42])).toBe(42);
	});

	it("should handle negative numbers", () => {
		expect(max([-5, -3, -1])).toBe(-1);
	});
});
