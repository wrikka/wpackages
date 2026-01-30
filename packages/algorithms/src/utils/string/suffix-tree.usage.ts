import { suffixTreeSearch } from "./suffix-tree";

const text = "banana";
const pattern = "ana";

const indices = suffixTreeSearch(text, pattern);

console.log("Text:", text);
console.log("Pattern:", pattern);
console.log("Found at indices:", indices);
