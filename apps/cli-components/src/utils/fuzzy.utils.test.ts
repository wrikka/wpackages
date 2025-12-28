import { describe, expect, it } from "vitest";
import { fuzzyFilter, fuzzyMatch } from "./fuzzy.utils";

describe("fuzzy.utils", () => {
	describe("fuzzyMatch", () => {
		it("should return highest score for exact match", () => {
			expect(fuzzyMatch("test", "test")).toBe(1000);
			expect(fuzzyMatch("hello", "hello")).toBe(1000);
		});

		it("should return high score for starts with", () => {
			expect(fuzzyMatch("hel", "hello")).toBe(500);
			expect(fuzzyMatch("te", "test")).toBe(500);
		});

		it("should return medium score for contains", () => {
			expect(fuzzyMatch("ell", "hello")).toBe(250);
			expect(fuzzyMatch("wor", "hello world")).toBe(250);
		});

		it("should return score for character-by-character match", () => {
			const score = fuzzyMatch("hlo", "hello");
			expect(score).toBeGreaterThan(0);
			expect(score).toBeLessThan(250);
		});

		it("should return 0 for no match", () => {
			expect(fuzzyMatch("xyz", "hello")).toBe(0);
			expect(fuzzyMatch("abc", "test")).toBe(0);
		});

		it("should be case insensitive", () => {
			expect(fuzzyMatch("TEST", "test")).toBe(1000);
			expect(fuzzyMatch("Test", "TEST")).toBe(1000);
		});
	});

	describe("fuzzyFilter", () => {
		const items = [
			{ name: "Apple", category: "fruit" },
			{ name: "Banana", category: "fruit" },
			{ name: "Carrot", category: "vegetable" },
			{ name: "Date", category: "fruit" },
		] as const;

		it("should return all items for empty query", () => {
			const result = fuzzyFilter("", items, (item) => item.name);
			expect(result).toEqual(items);
		});

		it("should filter and sort by score", () => {
			const result = fuzzyFilter("a", items, (item) => item.name);
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]?.name).toBe("Apple"); // starts with 'a'
		});

		it("should respect maxResults", () => {
			const result = fuzzyFilter("a", items, (item) => item.name, 2);
			expect(result.length).toBeLessThanOrEqual(2);
		});

		it("should return empty array for no matches", () => {
			const result = fuzzyFilter("xyz", items, (item) => item.name);
			expect(result).toEqual([]);
		});

		it("should handle custom label extractors", () => {
			const result = fuzzyFilter("fruit", items, (item) => item.category);
			expect(result.length).toBe(3); // Apple, Banana, Date
		});

		it("should be immutable", () => {
			const result = fuzzyFilter("a", items, (item) => item.name);
			expect(Object.isFrozen(result)).toBe(true);
		});
	});
});
