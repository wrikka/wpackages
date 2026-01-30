import { subsetSum } from "./subset-sum";

const numbers = [3, 34, 4, 12, 5, 2];
const target = 9;

const exists = subsetSum(numbers, target);

console.log("Numbers:", numbers);
console.log("Target:", target);
console.log("Subset exists:", exists);
