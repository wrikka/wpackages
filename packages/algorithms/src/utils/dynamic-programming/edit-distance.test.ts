import { describe, expect, it } from "vitest";
import { editDistance } from "./edit-distance";

describe("editDistance", () => {
	it("should calculate the edit distance between two strings", () => {
		expect(editDistance("kitten", "sitting")).toBe(3);
		expect(editDistance("horse", "ros")).toBe(3);
	});

	it("should handle empty strings", () => {
		expect(editDistance("", "abc")).toBe(3);
		expect(editDistance("abc", "")).toBe(3);
		expect(editDistance("", "")).toBe(0);
	});

	it("should handle identical strings", () => {
		expect(editDistance("hello", "hello")).toBe(0);
	});
});
