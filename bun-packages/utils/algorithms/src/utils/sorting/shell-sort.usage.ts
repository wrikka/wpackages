import { shellSort } from "./shell-sort";

const array = [64, 34, 25, 12, 22, 11, 90];
const sorted = shellSort(array);

console.log("Original array:", array);
console.log("Sorted array:", sorted);
