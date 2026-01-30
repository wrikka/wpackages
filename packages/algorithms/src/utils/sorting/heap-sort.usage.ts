import { heapSort } from "./heap-sort";

const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
const sortedArray = heapSort(unsortedArray);

console.log("Sorted array:", sortedArray);
