import { describe, expect, it } from "vitest";
import { rabinKarp } from "./rabin-karp";

describe("rabinKarp", () => {
	it("should find the pattern in the text", () => {
		const text = "AABAACAADAABAABA";
		const pattern = "AABA";
		expect(rabinKarp(text, pattern)).toBe(0);
	});

	it("should return the index of the first occurrence", () => {
		const text = "testabctestabc";
		const pattern = "abc";
		expect(rabinKarp(text, pattern)).toBe(4);
	});

	it("should return -1 if the pattern is not found", () => {
		const text = "hello world";
		const pattern = "bye";
		expect(rabinKarp(text, pattern)).toBe(-1);
	});

	it("should find the pattern at the end of the text", () => {
		const text = "find the pattern at the end";
		const pattern = "end";
		expect(rabinKarp(text, pattern)).toBe(24);
	});

	it("should handle patterns that could cause hash collisions", () => {
		// These might not cause collisions with the current prime/base, but it's a good test case.
		const text = "abacaba";
		const pattern = "aba";
		expect(rabinKarp(text, pattern)).toBe(0);
	});

	it("should return -1 if the pattern is longer than the text", () => {
		const text = "short";
		const pattern = "longer pattern";
		expect(rabinKarp(text, pattern)).toBe(-1);
	});

	it("should return 0 if the pattern is an empty string", () => {
		const text = "any text";
		const pattern = "";
		expect(rabinKarp(text, pattern)).toBe(0);
	});

	it("should return -1 if the text is empty but pattern is not", () => {
		const text = "";
		const pattern = "a";
		expect(rabinKarp(text, pattern)).toBe(-1);
	});
});
