import { parallelSort } from "./parallel-sort";

const array = Array.from({ length: 10000 }, () => Math.random());

const sorted = await parallelSort(array);
console.log("First 5 elements:", sorted.slice(0, 5));
