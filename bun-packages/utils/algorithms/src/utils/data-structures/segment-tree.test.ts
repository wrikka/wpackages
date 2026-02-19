import { describe, expect, it } from "vitest";
import { SegmentTree } from "./segment-tree";

describe("SegmentTree", () => {
	it("should query range sums correctly", () => {
		const data = [1, 3, 5, 7, 9, 11];
		const st = new SegmentTree(data);
		expect(st.query(0, 5)).toBe(36);
		expect(st.query(1, 3)).toBe(15);
	});

	it("should update values correctly", () => {
		const data = [1, 3, 5, 7, 9, 11];
		const st = new SegmentTree(data);
		st.update(2, 10);
		expect(st.query(0, 5)).toBe(41);
	});
});
