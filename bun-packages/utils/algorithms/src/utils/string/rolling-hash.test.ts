import { describe, expect, it } from "vitest";
import { rollingHashSearch } from "./rolling-hash";

describe("rollingHashSearch", () => {
	it("should find all occurrences of pattern in text", () => {
		expect(rollingHashSearch("ABAAABCD", "ABC")).toEqual([4]);
		expect(rollingHashSearch("ABABABAB", "ABA")).toEqual([0, 2, 4]);
	});

	it("should return empty array if pattern not found", () => {
		expect(rollingHashSearch("ABCD", "E")).toEqual([]);
	});

	it("should handle empty pattern", () => {
		expect(rollingHashSearch("ABCD", "")).toEqual([]);
	});

	it("should handle pattern longer than text", () => {
		expect(rollingHashSearch("AB", "ABC")).toEqual([]);
	});
});
