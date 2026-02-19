import { describe, expect, it } from "vitest";
import { RedBlackTree } from "./red-black-tree";

describe("RedBlackTree", () => {
	it("should insert and search values", () => {
		const rbt = new RedBlackTree<number>();
		rbt.insert(10);
		rbt.insert(20);
		rbt.insert(30);
		expect(rbt.search(20)).toBe(true);
		expect(rbt.search(100)).toBe(false);
	});

	it("should handle multiple insertions", () => {
		const rbt = new RedBlackTree<number>();
		rbt.insert(10);
		rbt.insert(5);
		rbt.insert(15);
		expect(rbt.search(5)).toBe(true);
		expect(rbt.search(15)).toBe(true);
	});
});
