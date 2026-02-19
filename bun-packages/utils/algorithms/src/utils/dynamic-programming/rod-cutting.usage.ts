import { rodCutting } from "./rod-cutting";

const prices = [1, 5, 8, 9, 10, 17, 17, 20];
const length = 8;

const maxValue = rodCutting(prices, length);

console.log("Prices:", prices);
console.log("Rod length:", length);
console.log("Maximum value:", maxValue);
