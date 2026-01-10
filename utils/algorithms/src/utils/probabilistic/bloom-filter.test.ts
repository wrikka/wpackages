import { describe, expect, it } from "vitest";
import { BloomFilter } from "./bloom-filter";

describe("BloomFilter", () => {
	it("should correctly add items and check for their existence", () => {
		const filter = new BloomFilter(100, 4);
		filter.add("apple");
		filter.add("banana");

		expect(filter.has("apple")).toBe(true);
		expect(filter.has("banana")).toBe(true);
	});

	it("should likely return false for items not added to the filter", () => {
		const filter = new BloomFilter(100, 4);
		filter.add("apple");

		// Note: There's a small chance of a false positive, but it's unlikely with this setup.
		expect(filter.has("orange")).toBe(false);
		expect(filter.has("grape")).toBe(false);
	});

	it("should handle an empty filter", () => {
		const filter = new BloomFilter();
		expect(filter.has("anything")).toBe(false);
	});

	it("should handle multiple additions of the same item", () => {
		const filter = new BloomFilter();
		filter.add("test");
		filter.add("test");
		expect(filter.has("test")).toBe(true);
	});

	it("may produce false positives but not false negatives", () => {
		const filter = new BloomFilter(10, 2); // Small size to increase chance of collision
		filter.add("a");
		filter.add("b");
		filter.add("c");

		expect(filter.has("a")).toBe(true);
		expect(filter.has("b")).toBe(true);
		expect(filter.has("c")).toBe(true);

		// 'd' was not added, but it might return true (false positive).
		// It will never return false for 'a', 'b', or 'c' (no false negatives).
		const hasD = filter.has("d");
		// We cannot assert hasD is false, because it might be true.
		expect(typeof hasD).toBe("boolean");
	});
});
