import { describe, expect, it } from "vitest";
import { chineseRemainderTheorem } from "./chinese-remainder-theorem";

describe("chineseRemainderTheorem", () => {
	it("should solve CRT correctly", () => {
		expect(chineseRemainderTheorem([2, 3, 2], [3, 5, 7])).toBe(23);
	});

	it("should handle two equations", () => {
		expect(chineseRemainderTheorem([1, 2], [3, 5])).toBe(7);
	});

	it("should throw error for mismatched arrays", () => {
		expect(() => chineseRemainderTheorem([1, 2], [3])).toThrow();
	});
});
