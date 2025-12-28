import { describe, expect, it } from "vitest";
import { levenshteinDistance, similarityScore, findMostSimilar } from "./string-similarity";

describe("levenshteinDistance", () => {
	it("should calculate distance between identical strings", () => {
		expect(levenshteinDistance("hello", "hello")).toBe(0);
	});

	it("should calculate distance between different strings", () => {
		expect(levenshteinDistance("kitten", "sitting")).toBe(3);
	});

	it("should calculate similarity score", () => {
		const score = similarityScore("hello", "hello");
		expect(score).toBe(1);
	});

	it("should find most similar string", () => {
		const candidates = ["hallo", "hxllo", "world"];
		const result = findMostSimilar("hello", candidates);
		expect(result).toBe("hallo");
	});
});
