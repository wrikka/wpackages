/**
 * Array utility usage examples
 */

import * as Arr from "./array.util";

// Example 1: Filter and map
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenDoubled = Arr.map(
	Arr.filter(numbers, (n) => n % 2 === 0),
	(n) => n * 2,
);
console.log("Even doubled:", evenDoubled); // [4, 8, 12, 16, 20]

// Example 2: Partition
const [positive, negative] = Arr.partition([-2, -1, 0, 1, 2], (n) => n > 0);
console.log("Positive:", positive); // [1, 2]
console.log("Negative:", negative); // [-2, -1, 0]

// Example 3: Group by
type Item = { category: string; name: string };
const items: Item[] = [
	{ category: "fruit", name: "apple" },
	{ category: "vegetable", name: "carrot" },
	{ category: "fruit", name: "banana" },
];
const grouped = Arr.groupBy(items, (item) => item.category);
console.log("Grouped:", grouped);

// Example 4: Unique and sort
const duplicates = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
const uniqueSorted = Arr.sortBy(Arr.unique(duplicates), (n) => n);
console.log("Unique sorted:", uniqueSorted); // [1, 2, 3, 4, 5, 6, 9]
