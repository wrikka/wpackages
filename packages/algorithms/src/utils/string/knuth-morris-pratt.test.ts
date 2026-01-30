import { describe, expect, it } from "vitest";
import { knuthMorrisPratt } from "./knuth-morris-pratt";

describe("knuthMorrisPratt", () => {
	it("should find the pattern in the text", () => {
		const text = "ABABDABACDABABCABAB";
		const pattern = "ABABCABAB";
		expect(knuthMorrisPratt(text, pattern)).toBe(10);
	});

	it("should return the index of the first occurrence", () => {
		const text = "ababab";
		const pattern = "ab";
		expect(knuthMorrisPratt(text, pattern)).toBe(0);
	});

	it("should return -1 if the pattern is not found", () => {
		const text = "hello world";
		const pattern = "bye";
		expect(knuthMorrisPratt(text, pattern)).toBe(-1);
	});

	it("should find the pattern at the beginning of the text", () => {
		const text = "pattern in the beginning";
		const pattern = "pattern";
		expect(knuthMorrisPratt(text, pattern)).toBe(0);
	});

	it("should find the pattern at the end of the text", () => {
		const text = "this is the end pattern";
		const pattern = "pattern";
		expect(knuthMorrisPratt(text, pattern)).toBe(16);
	});

	it("should handle overlapping patterns", () => {
		const text = "aaaaa";
		const pattern = "aa";
		expect(knuthMorrisPratt(text, pattern)).toBe(0);
	});

	it("should return -1 if the pattern is longer than the text", () => {
		const text = "short";
		const pattern = "longer pattern";
		expect(knuthMorrisPratt(text, pattern)).toBe(-1);
	});

	it("should return 0 if the pattern is an empty string", () => {
		const text = "any text";
		const pattern = "";
		expect(knuthMorrisPratt(text, pattern)).toBe(0);
	});

	it("should return -1 if the text is empty but pattern is not", () => {
		const text = "";
		const pattern = "a";
		expect(knuthMorrisPratt(text, pattern)).toBe(-1);
	});
});
