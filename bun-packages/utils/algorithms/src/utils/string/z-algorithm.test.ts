import { describe, expect, it } from "vitest";
import { zAlgorithmSearch } from "./z-algorithm";

describe("zAlgorithmSearch", () => {
	it("should find a single occurrence of the pattern", () => {
		const text = "abxabcabcaby";
		const pattern = "abcaby";
		expect(zAlgorithmSearch(text, pattern)).toEqual([6]);
	});

	it("should find multiple occurrences of the pattern", () => {
		const text = "ababaaba";
		const pattern = "aba";
		expect(zAlgorithmSearch(text, pattern)).toEqual([0, 2, 5]);
	});

	it("should return an empty array if the pattern is not found", () => {
		const text = "hello world";
		const pattern = "test";
		expect(zAlgorithmSearch(text, pattern)).toEqual([]);
	});

	it("should handle overlapping patterns", () => {
		const text = "aaaaa";
		const pattern = "aa";
		expect(zAlgorithmSearch(text, pattern)).toEqual([0, 1, 2, 3]);
	});

	it("should find the pattern at the beginning and end", () => {
		const text = "pattern at the end and pattern at the start";
		const pattern = "pattern";
		expect(zAlgorithmSearch(text, pattern)).toEqual([0, 23]);
	});

	it("should return an empty array if the pattern is an empty string", () => {
		const text = "any text";
		const pattern = "";
		expect(zAlgorithmSearch(text, pattern)).toEqual([]);
	});

	it("should return an empty array if the text is empty", () => {
		const text = "";
		const pattern = "a";
		expect(zAlgorithmSearch(text, pattern)).toEqual([]);
	});

	it("should return an empty array if pattern is longer than text", () => {
		const text = "short";
		const pattern = "longerpattern";
		expect(zAlgorithmSearch(text, pattern)).toEqual([]);
	});
});
