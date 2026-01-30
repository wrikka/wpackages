import { describe, expect, it } from "vitest";
import { boyerMoore } from "./boyer-moore";

describe("boyerMoore", () => {
	it("should find all occurrences of pattern in text", () => {
		expect(boyerMoore("ABAAABCD", "ABC")).toEqual([4]);
		expect(boyerMoore("ABABABAB", "ABA")).toEqual([0, 2, 4]);
	});

	it("should return empty array if pattern not found", () => {
		expect(boyerMoore("ABCD", "E")).toEqual([]);
	});

	it("should handle empty pattern", () => {
		expect(boyerMoore("ABCD", "")).toEqual([]);
	});

	it("should handle pattern longer than text", () => {
		expect(boyerMoore("AB", "ABC")).toEqual([]);
	});
});
