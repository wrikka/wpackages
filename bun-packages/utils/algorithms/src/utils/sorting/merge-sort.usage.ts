import { mergeSort } from "./merge-sort";

const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
const sortedArray = mergeSort(unsortedArray);

console.log("Sorted array:", sortedArray);
