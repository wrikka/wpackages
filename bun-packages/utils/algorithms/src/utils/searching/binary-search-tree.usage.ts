import { binarySearchTreeSearch } from "./binary-search-tree";

const values = [5, 3, 7, 2, 4, 6, 8];
const target = 6;

const found = binarySearchTreeSearch(values, target);

if (found) {
	console.log(`Target ${target} found in the binary search tree.`);
} else {
	console.log(`Target ${target} not found in the binary search tree.`);
}
