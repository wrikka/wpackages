import { describe, expect, it } from "vitest";
import { patternMatching } from "./pattern-matching";

describe("patternMatching", () => {
	it("should find all occurrences of pattern in text", () => {
		expect(patternMatching("ABAAABCD", "ABC")).toEqual([4]);
		expect(patternMatching("ABABABAB", "ABA")).toEqual([0, 2, 4]);
	});

	it("should return empty array if pattern not found", () => {
		expect(patternMatching("ABCD", "E")).toEqual([]);
	});

	it("should handle empty pattern", () => {
		expect(patternMatching("ABCD", "")).toEqual([]);
	});

	it("should handle pattern longer than text", () => {
		expect(patternMatching("AB", "ABC")).toEqual([]);
	});
});
