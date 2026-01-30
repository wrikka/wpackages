import { boyerMoore } from "./boyer-moore";

const text = "ABAAABCD";
const pattern = "ABC";

const positions = boyerMoore(text, pattern);

console.log("Text:", text);
console.log("Pattern:", pattern);
console.log("Found at positions:", positions);
