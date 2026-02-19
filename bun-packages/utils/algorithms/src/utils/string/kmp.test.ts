import { describe, expect, it } from "vitest";
import { kmpSearch } from "./kmp";

describe("kmpSearch", () => {
	it("should find pattern occurrences", () => {
		const text = "ABABDABACDABABCABAB";
		const pattern = "ABABCABAB";
		const result = kmpSearch(text, pattern);
		expect(result).toEqual([10]);
	});

	it("should find multiple occurrences", () => {
		const text = "ABABABAB";
		const pattern = "ABA";
		const result = kmpSearch(text, pattern);
		expect(result).toEqual([0, 2, 4]);
	});

	it("should return empty array for empty pattern", () => {
		const text = "ABCDEF";
		const pattern = "";
		const result = kmpSearch(text, pattern);
		expect(result).toEqual([]);
	});

	it("should return empty array when pattern not found", () => {
		const text = "ABCDEF";
		const pattern = "XYZ";
		const result = kmpSearch(text, pattern);
		expect(result).toEqual([]);
	});

	it("should handle pattern longer than text", () => {
		const text = "AB";
		const pattern = "ABC";
		const result = kmpSearch(text, pattern);
		expect(result).toEqual([]);
	});
});
