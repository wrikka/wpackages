import { patternMatching } from "./pattern-matching";

const text = "ABAAABCD";
const pattern = "ABC";

const positions = patternMatching(text, pattern);

console.log("Text:", text);
console.log("Pattern:", pattern);
console.log("Found at positions:", positions);
