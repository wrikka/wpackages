import { describe, expect, it } from "vitest";
import { longestPalindromicSubsequence } from "./longest-palindromic-subsequence";

describe("longestPalindromicSubsequence", () => {
	it("should find the length of the longest palindromic subsequence", () => {
		expect(longestPalindromicSubsequence("bbbab")).toBe(4);
		expect(longestPalindromicSubsequence("cbbd")).toBe(2);
	});

	it("should handle an empty string", () => {
		expect(longestPalindromicSubsequence("")).toBe(0);
	});

	it("should handle a single character", () => {
		expect(longestPalindromicSubsequence("a")).toBe(1);
	});

	it("should handle a palindrome", () => {
		expect(longestPalindromicSubsequence("racecar")).toBe(7);
	});
});
