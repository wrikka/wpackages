import { knuthMorrisPratt } from "./knuth-morris-pratt";

// Usage example for knuthMorrisPratt
const text = "ABABDABACDABABCABAB";
const pattern = "ABABCABAB";

const index = knuthMorrisPratt(text, pattern);

if (index !== -1) {
	console.log(`Pattern found at index ${index}.`);
} else {
	console.log("Pattern not found.");
}
