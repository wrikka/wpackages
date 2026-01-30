import { longestIncreasingSubsequence } from "./longest-increasing-subsequence";

const array = [10, 22, 9, 33, 21, 50, 41, 60];
const lis = longestIncreasingSubsequence(array);

console.log("Original array:", array);
console.log("Longest Increasing Subsequence:", lis);
console.log("Length:", lis.length);
