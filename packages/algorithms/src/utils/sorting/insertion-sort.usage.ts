import { insertionSort } from "./insertion-sort";

const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
const sortedArray = insertionSort(unsortedArray);

console.log("Sorted array:", sortedArray);
