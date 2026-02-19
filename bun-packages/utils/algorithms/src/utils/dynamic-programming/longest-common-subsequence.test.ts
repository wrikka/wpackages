import { describe, expect, it } from "vitest";
import { longestCommonSubsequence } from "./longest-common-subsequence";

describe("longestCommonSubsequence", () => {
	it("should find the longest common subsequence of two strings", () => {
		const str1 = "AGGTAB";
		const str2 = "GXTXAYB";
		expect(longestCommonSubsequence(str1, str2)).toBe("GTAB");
	});

	it("should return an empty string if there is no common subsequence", () => {
		const str1 = "abc";
		const str2 = "def";
		expect(longestCommonSubsequence(str1, str2)).toBe("");
	});

	it("should return an empty string if one of the strings is empty", () => {
		const str1 = "abc";
		const str2 = "";
		expect(longestCommonSubsequence(str1, str2)).toBe("");
		expect(longestCommonSubsequence(str2, str1)).toBe("");
	});

	it("should return the string itself if the strings are identical", () => {
		const str1 = "abc";
		const str2 = "abc";
		expect(longestCommonSubsequence(str1, str2)).toBe("abc");
	});

	it("should handle complex cases", () => {
		const str1 = "ABCDGH";
		const str2 = "AEDFHR";
		expect(longestCommonSubsequence(str1, str2)).toBe("ADH");
	});

	it("should handle another complex case", () => {
		const str1 = "stone";
		const str2 = "longest";
		// Multiple LCSs exist, e.g., 'one', 'ote'. The implementation will pick one.
		const result = longestCommonSubsequence(str1, str2);
		expect(["one", "ote"]).toContain(result);
	});
});
