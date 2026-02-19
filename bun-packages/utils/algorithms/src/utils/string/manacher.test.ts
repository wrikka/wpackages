import { describe, expect, it } from "vitest";
import { manacher } from "./manacher";

describe("manacher", () => {
	it("should find the longest palindromic substring", () => {
		expect(manacher("babad")).toContain("bab");
		expect(manacher("cbbd")).toContain("bb");
	});

	it("should handle empty string", () => {
		expect(manacher("")).toEqual([]);
	});

	it("should handle single character", () => {
		expect(manacher("a")).toContain("a");
	});

	it("should handle palindrome", () => {
		expect(manacher("racecar")).toContain("racecar");
	});
});
