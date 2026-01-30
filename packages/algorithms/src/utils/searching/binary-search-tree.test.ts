import { describe, expect, it } from "vitest";
import { BinarySearchTree, binarySearchTreeSearch } from "./binary-search-tree";

describe("BinarySearchTree", () => {
	it("should insert and search values correctly", () => {
		const bst = new BinarySearchTree<number>();
		bst.insert(5);
		bst.insert(3);
		bst.insert(7);
		expect(bst.search(5)).toBe(true);
		expect(bst.search(3)).toBe(true);
		expect(bst.search(7)).toBe(true);
		expect(bst.search(1)).toBe(false);
	});

	it("should perform inorder traversal correctly", () => {
		const bst = new BinarySearchTree<number>();
		bst.insert(5);
		bst.insert(3);
		bst.insert(7);
		bst.insert(2);
		bst.insert(4);
		expect(bst.inorderTraversal()).toEqual([2, 3, 4, 5, 7]);
	});

	it("should handle duplicate values", () => {
		const bst = new BinarySearchTree<number>();
		bst.insert(5);
		bst.insert(5);
		bst.insert(5);
		expect(bst.search(5)).toBe(true);
		expect(bst.inorderTraversal()).toEqual([5]);
	});
});

describe("binarySearchTreeSearch", () => {
	it("should find a value in the BST", () => {
		const values = [5, 3, 7, 2, 4, 6, 8];
		expect(binarySearchTreeSearch(values, 6)).toBe(true);
	});

	it("should return false if value not in BST", () => {
		const values = [5, 3, 7, 2, 4, 6, 8];
		expect(binarySearchTreeSearch(values, 10)).toBe(false);
	});
});
