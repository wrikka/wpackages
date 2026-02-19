import { describe, expect, it } from "vitest";
import { suffixTreeSearch } from "./suffix-tree";

describe("suffixTreeSearch", () => {
	it("should find all occurrences of pattern in text", () => {
		const indices = suffixTreeSearch("banana", "ana");
		expect(indices).toBeTruthy();
		expect(indices!.length).toBeGreaterThan(0);
	});

	it("should return null if pattern not found", () => {
		expect(suffixTreeSearch("banana", "xyz")).toBeNull();
	});

	it("should handle empty pattern", () => {
		expect(suffixTreeSearch("banana", "")).not.toBeNull();
	});
});
