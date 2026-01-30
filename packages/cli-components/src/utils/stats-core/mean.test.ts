import { describe, expect, it } from "vitest";
import { mean } from "../stats-core";

describe("mean", () => {
	it("should calculate mean correctly", () => {
		expect(mean([1, 2, 3, 4, 5])).toBe(3);
	});

	it("should handle empty array", () => {
		expect(mean([])).toBe(0);
	});

	it("should handle single value", () => {
		expect(mean([42])).toBe(42);
	});

	it("should handle negative numbers", () => {
		expect(mean([-5, -3, -1])).toBe(-3);
	});

	it("should handle decimal numbers", () => {
		expect(mean([1.5, 2.5, 3.5])).toBe(2.5);
	});
});
