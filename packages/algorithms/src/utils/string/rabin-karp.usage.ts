import { rabinKarp } from "./rabin-karp";

const text = "AABAACAADAABAABA";
const pattern = "AABA";

const index = rabinKarp(text, pattern);

if (index !== -1) {
	console.log(`Pattern found at index ${index}.`);
} else {
	console.log("Pattern not found.");
}
