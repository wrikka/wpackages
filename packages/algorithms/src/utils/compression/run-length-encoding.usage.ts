import { runLengthEncoding, runLengthDecoding } from "./run-length-encoding";

const text = "AAAABBBCCDAA";
const encoded = runLengthEncoding(text);
const decoded = runLengthDecoding(encoded);

console.log("Original:", text);
console.log("Encoded:", encoded);
console.log("Decoded:", decoded);
console.log("Match:", text === decoded);
