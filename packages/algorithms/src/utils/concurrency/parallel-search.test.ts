import { describe, expect, it } from "vitest";
import { parallelSearch } from "./parallel-search";

describe("parallel-search", () => {
	it("should find element in array", async () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const index = await parallelSearch(array, 5);
		expect(index).toBe(4);
	});

	it("should return -1 for element not in array", async () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const index = await parallelSearch(array, 11);
		expect(index).toBe(-1);
	});

	it("should find first element", async () => {
		const array = [1, 2, 3, 4, 5];
		const index = await parallelSearch(array, 1);
		expect(index).toBe(0);
	});

	it("should find last element", async () => {
		const array = [1, 2, 3, 4, 5];
		const index = await parallelSearch(array, 5);
		expect(index).toBe(4);
	});

	it("should use custom compare function", async () => {
		const array = ["apple", "banana", "cherry", "date"];
		const index = await parallelSearch(array, "cherry", (a, b) => a.localeCompare(b));
		expect(index).toBe(2);
	});

	it("should handle empty array", async () => {
		const index = await parallelSearch([], 1);
		expect(index).toBe(-1);
	});

	it("should handle large arrays", async () => {
		const array = Array.from({ length: 5000 }, (_, i) => i * 2);
		const index = await parallelSearch(array, 5000);
		expect(index).toBe(2500);
	});
});
