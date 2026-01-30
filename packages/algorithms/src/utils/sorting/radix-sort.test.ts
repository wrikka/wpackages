import { describe, expect, it } from "vitest";
import { radixSort } from "./radix-sort";

describe("radixSort", () => {
	it("should sort an array of positive integers", () => {
		const arr = [170, 45, 75, 90, 802, 24, 2, 66];
		expect(radixSort(arr)).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
	});

	it("should handle an already sorted array", () => {
		const arr = [1, 2, 3, 4, 5];
		expect(radixSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle a reverse-sorted array", () => {
		const arr = [5, 4, 3, 2, 1];
		expect(radixSort(arr)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle an array with duplicate elements", () => {
		const arr = [5, 2, 8, 2, 5, 1];
		expect(radixSort(arr)).toEqual([1, 2, 2, 5, 5, 8]);
	});

	it("should handle an array with a single element", () => {
		const arr = [42];
		expect(radixSort(arr)).toEqual([42]);
	});

	it("should return an empty array for an empty input array", () => {
		const arr: number[] = [];
		expect(radixSort(arr)).toEqual([]);
	});

	it("should sort an array containing zero", () => {
		const arr = [5, 0, 3, 1, 2, 4];
		expect(radixSort(arr)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it("should handle numbers with varying number of digits", () => {
		const arr = [100, 1, 1000, 10];
		expect(radixSort(arr)).toEqual([1, 10, 100, 1000]);
	});

	it("should throw for negative numbers", () => {
		const arr = [3, -1, 2];
		expect(() => radixSort(arr)).toThrow(
			"radixSort only supports non-negative integers",
		);
	});

	it("should throw for non-integer numbers", () => {
		const arr = [3.1, 2, 1];
		expect(() => radixSort(arr)).toThrow(
			"radixSort only supports non-negative integers",
		);
	});
});
