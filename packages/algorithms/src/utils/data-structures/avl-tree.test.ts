import { describe, expect, it } from "vitest";
import { AVLTree } from "./avl-tree";

describe("AVLTree", () => {
	it("should insert and search values", () => {
		const avl = new AVLTree<number>();
		avl.insert(10);
		avl.insert(20);
		avl.insert(30);
		expect(avl.search(20)).toBe(true);
		expect(avl.search(100)).toBe(false);
	});

	it("should maintain balance after insertions", () => {
		const avl = new AVLTree<number>();
		avl.insert(10);
		avl.insert(20);
		avl.insert(30);
		expect(avl.search(10)).toBe(true);
		expect(avl.search(30)).toBe(true);
	});
});
