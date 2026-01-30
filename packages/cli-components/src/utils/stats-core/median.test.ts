import { describe, expect, it } from "vitest";
import { median } from "../stats-core";

describe("median", () => {
	it("should calculate median for odd length array", () => {
		expect(median([1, 2, 3, 4, 5])).toBe(3);
	});

	it("should calculate median for even length array", () => {
		expect(median([1, 2, 3, 4])).toBe(2.5);
	});

	it("should handle empty array", () => {
		expect(median([])).toBe(0);
	});

	it("should handle single value", () => {
		expect(median([42])).toBe(42);
	});

	it("should handle unsorted array", () => {
		expect(median([5, 1, 3, 2, 4])).toBe(3);
	});
});
