import { kadanesAlgorithm } from "./kadanes-algorithm";

const array = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
const maxSum = kadanesAlgorithm(array);

console.log(`The maximum subarray sum is: ${maxSum}`); // Output: 6
