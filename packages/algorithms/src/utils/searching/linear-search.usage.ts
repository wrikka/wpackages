import { linearSearch } from "./linear-search";

const array = [5, 3, 8, 1, 2, 7];
const target = 8;

const index = linearSearch(array, target);

if (index !== -1) {
	console.log(`Target ${target} found at index ${index}.`);
} else {
	console.log(`Target ${target} not found in the array.`);
}
