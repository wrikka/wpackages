import { interpolationSearch } from "./interpolation-search";

const sortedArray = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
const target = 64;

const index = interpolationSearch(sortedArray, target);

if (index !== -1) {
	console.log(`Target ${target} found at index ${index}.`);
} else {
	console.log(`Target ${target} not found in the array.`);
}
