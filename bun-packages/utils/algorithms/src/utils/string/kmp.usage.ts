import { kmpSearch } from "./kmp";

const text = "ABABDABACDABABCABAB";
const pattern = "ABABCABAB";
const result = kmpSearch(text, pattern);

console.log("Text:", text);
console.log("Pattern:", pattern);
console.log("Pattern found at indices:", result);
