import { binarySearch } from "./binary-search";

const sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;

const index = binarySearch(sortedArray, target);

if (index !== -1) {
	console.log(`Target ${target} found at index ${index}.`);
} else {
	console.log(`Target ${target} not found in the array.`);
}
