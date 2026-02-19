import { buildSuffixArray } from "./suffix-array";

const str = "banana";
const suffixArray = buildSuffixArray(str);

console.log("String:", str);
console.log("Suffix array:", suffixArray);
console.log("Suffixes:");
suffixArray.forEach((i) => {
	console.log(`${i}: ${str.slice(i)}`);
});
