import { describe, expect, it } from "vitest";
import { buildSuffixArray } from "./suffix-array";

describe("buildSuffixArray", () => {
	it("should build the suffix array", () => {
		const sa = buildSuffixArray("banana");
		expect(sa.length).toBe(6);
	});

	it("should handle empty string", () => {
		expect(buildSuffixArray("")).toEqual([]);
	});

	it("should handle single character", () => {
		expect(buildSuffixArray("a")).toEqual([0]);
	});
});
