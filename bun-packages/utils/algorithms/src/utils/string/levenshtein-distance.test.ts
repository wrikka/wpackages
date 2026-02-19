import { describe, expect, it } from "vitest";
import { levenshteinDistance } from "./levenshtein-distance";

describe("levenshteinDistance", () => {
	it("should return 0 for identical strings", () => {
		expect(levenshteinDistance("hello", "hello")).toBe(0);
	});

	it("should calculate the distance for strings with different lengths", () => {
		expect(levenshteinDistance("kitten", "sitting")).toBe(3); // s/k, i/e, g added
	});

	it("should calculate the distance when one string is empty", () => {
		expect(levenshteinDistance("hello", "")).toBe(5);
		expect(levenshteinDistance("", "world")).toBe(5);
	});

	it("should return 0 when both strings are empty", () => {
		expect(levenshteinDistance("", "")).toBe(0);
	});

	it("should handle substitutions", () => {
		expect(levenshteinDistance("book", "back")).toBe(2);
	});

	it("should handle insertions", () => {
		expect(levenshteinDistance("cat", "cast")).toBe(1);
	});

	it("should handle deletions", () => {
		expect(levenshteinDistance("apple", "ale")).toBe(2);
	});

	it("should be case-sensitive", () => {
		expect(levenshteinDistance("Hello", "hello")).toBe(1);
	});
});
