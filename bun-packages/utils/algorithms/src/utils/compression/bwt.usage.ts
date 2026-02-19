import { bwtCoding } from "./bwt";

const text = "banana";
const result = bwtCoding(text);

console.log("Original Text:", text);
console.log("BWT Transformed:", result.encoded.transformed);
console.log("BWT Index:", result.encoded.index);
console.log("Decoded Text:", result.decoded);
