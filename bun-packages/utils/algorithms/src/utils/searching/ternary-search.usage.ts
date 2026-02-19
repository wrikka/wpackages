import { ternarySearch } from "./ternary-search";

const sortedArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const target = 6;

const index = ternarySearch(sortedArray, target);

if (index !== -1) {
	console.log(`Target ${target} found at index ${index}.`);
} else {
	console.log(`Target ${target} not found in the array.`);
}
