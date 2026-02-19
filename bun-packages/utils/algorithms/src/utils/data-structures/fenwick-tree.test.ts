import { describe, expect, it } from "vitest";
import { FenwickTree } from "./fenwick-tree";

describe("FenwickTree", () => {
	it("should update and query correctly", () => {
		const ft = new FenwickTree(10);
		ft.update(1, 5);
		ft.update(2, 3);
		expect(ft.query(2)).toBe(8);
	});

	it("should handle range queries", () => {
		const ft = new FenwickTree(10);
		ft.update(1, 5);
		ft.update(3, 2);
		ft.update(5, 3);
		expect(ft.rangeQuery(2, 5)).toBe(5);
	});
});
