import { zAlgorithmSearch } from "./z-algorithm";

const text = "ababaaba";
const pattern = "aba";

const occurrences = zAlgorithmSearch(text, pattern);

if (occurrences.length > 0) {
	console.log(`Pattern found at indices: ${occurrences.join(", ")}.`);
} else {
	console.log("Pattern not found.");
}
