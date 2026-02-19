import { describe, expect, it } from "vitest";
import { parallelSort } from "./parallel-sort";

describe("parallel-sort", () => {
	it("should sort an array of numbers", async () => {
		const array = [5, 3, 8, 1, 2, 7, 4, 6];
		const sorted = await parallelSort(array);
		expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
	});

	it("should sort an array of strings", async () => {
		const array = ["banana", "apple", "cherry", "date"];
		const sorted = await parallelSort(array);
		expect(sorted).toEqual(["apple", "banana", "cherry", "date"]);
	});

	it("should use custom compare function", async () => {
		const array = [5, 3, 8, 1, 2];
		const sorted = await parallelSort(array, (a, b) => b - a);
		expect(sorted).toEqual([8, 5, 3, 2, 1]);
	});

	it("should handle empty array", async () => {
		const sorted = await parallelSort([]);
		expect(sorted).toEqual([]);
	});

	it("should handle single element array", async () => {
		const sorted = await parallelSort([1]);
		expect(sorted).toEqual([1]);
	});

	it("should handle large arrays", async () => {
		const array = Array.from({ length: 5000 }, () => Math.random());
		const sorted = await parallelSort(array);
		for (let i = 1; i < sorted.length; i++) {
			expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
		}
	});

	it("should respect concurrency parameter", async () => {
		const array = Array.from({ length: 2000 }, () => Math.random());
		const sorted = await parallelSort(array, undefined, 2);
		for (let i = 1; i < sorted.length; i++) {
			expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
		}
	});
});
