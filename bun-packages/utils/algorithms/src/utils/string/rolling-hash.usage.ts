import { rollingHashSearch } from "./rolling-hash";

const text = "ABAAABCD";
const pattern = "ABC";

const positions = rollingHashSearch(text, pattern);

console.log("Text:", text);
console.log("Pattern:", pattern);
console.log("Found at positions:", positions);
