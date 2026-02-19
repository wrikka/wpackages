import { lz78Coding } from "./lz78";

const text = "abababababababababab";
const result = lz78Coding(text);

console.log("Original Text:", text);
console.log("Encoded Tokens:", result.encoded);
console.log("Decoded Text:", result.decoded);
console.log("Compression Ratio:", (text.length / result.encoded.length).toFixed(2));
