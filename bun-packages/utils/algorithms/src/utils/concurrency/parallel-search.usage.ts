import { parallelSearch } from "./parallel-search";

const array = Array.from({ length: 10000 }, (_, i) => i * 2);

const index = await parallelSearch(array, 5000);
console.log("Found at index:", index);
