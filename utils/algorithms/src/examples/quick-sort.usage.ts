import { quickSort } from '../sorting/quick-sort';

// 1. Example with an unsorted array of numbers
const unsortedArray = [5, 2, 8, 1, 9, 4, 2, 8];
console.log('Original array:', unsortedArray);

const sortedArray = quickSort(unsortedArray);
console.log('Sorted array:', sortedArray); // Output: [1, 2, 2, 4, 5, 8, 8, 9]

// 2. Example with a reverse-sorted array
const reverseSorted = [10, 9, 8, 7, 6, 5];
console.log('\nOriginal array:', reverseSorted);

const sortedReverse = quickSort(reverseSorted);
console.log('Sorted array:', sortedReverse); // Output: [5, 6, 7, 8, 9, 10]

// 3. Example with an empty array
const emptyArray: number[] = [];
console.log('\nOriginal array:', emptyArray);

const sortedEmpty = quickSort(emptyArray);
console.log('Sorted array:', sortedEmpty); // Output: []

// 4. Check that the original array is not mutated
console.log('\nOriginal unsorted array after sorting:', unsortedArray); // Output: [5, 2, 8, 1, 9, 4, 2, 8]
