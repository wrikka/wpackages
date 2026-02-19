import { radixSort } from "./radix-sort";

const unsortedArray = [170, 45, 75, 90, 802, 24, 2, 66];
const sortedArray = radixSort(unsortedArray);

console.log("Sorted array:", sortedArray);
