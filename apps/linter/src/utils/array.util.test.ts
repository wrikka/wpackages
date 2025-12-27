import { describe, expect, it } from "vitest";
import * as Arr from "./array.util";

describe("Array utilities", () => {
	const numbers = [1, 2, 3, 4, 5] as const;

	it("should filter array", () => {
		const even = Arr.filter(numbers, (n) => n % 2 === 0);
		expect(even).toEqual([2, 4]);
	});

	it("should map array", () => {
		const doubled = Arr.map(numbers, (n) => n * 2);
		expect(doubled).toEqual([2, 4, 6, 8, 10]);
	});

	it("should flatMap array", () => {
		const result = Arr.flatMap(numbers, (n) => [n, n * 2]);
		expect(result).toEqual([1, 2, 2, 4, 3, 6, 4, 8, 5, 10]);
	});

	it("should reduce array", () => {
		const sum = Arr.reduce(numbers, (acc, n) => acc + n, 0);
		expect(sum).toBe(15);
	});

	it("should partition array", () => {
		const [even, odd] = Arr.partition(numbers, (n) => n % 2 === 0);
		expect(even).toEqual([2, 4]);
		expect(odd).toEqual([1, 3, 5]);
	});

	it("should group by key", () => {
		const grouped = Arr.groupBy(numbers, (n) => (n % 2 === 0 ? "even" : "odd"));
		expect(grouped.even).toEqual([2, 4]);
		expect(grouped.odd).toEqual([1, 3, 5]);
	});

	it("should get unique values", () => {
		const withDuplicates = [1, 2, 2, 3, 3, 3];
		expect(Arr.unique(withDuplicates)).toEqual([1, 2, 3]);
	});

	it("should sort by key", () => {
		const items = [{ id: 3 }, { id: 1 }, { id: 2 }];
		const sorted = Arr.sortBy(items, (item) => item.id);
		expect(sorted).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
	});

	it("should check if empty", () => {
		expect(Arr.isEmpty([])).toBe(true);
		expect(Arr.isEmpty(numbers)).toBe(false);
		expect(Arr.isNotEmpty(numbers)).toBe(true);
	});
});
