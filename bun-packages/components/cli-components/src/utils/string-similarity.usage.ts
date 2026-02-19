import { findMostSimilar, findSimilar, levenshteinDistance, similarityScore } from "./string-similarity";

/**
 * ตัวอย่างการใช้งาน string-similarity utils
 *
 * Run: bun run components/tui/src/utils/string-similarity.usage.ts
 */

console.log("--- String Similarity Usage Example ---");

// 1. levenshteinDistance
const dist1 = levenshteinDistance("kitten", "sitting");
console.log(`\nLevenshtein distance between "kitten" and "sitting": ${dist1}`); // Expected: 3

const dist2 = levenshteinDistance("book", "back");
console.log(`Levenshtein distance between "book" and "back": ${dist2}`); // Expected: 2

// 2. similarityScore
const score1 = similarityScore("hello", "hell");
console.log(`\nSimilarity score between "hello" and "hell": ${score1.toFixed(2)}`); // Expected: ~0.80

const score2 = similarityScore("apple", "apply");
console.log(`Similarity score between "apple" and "apply": ${score2.toFixed(2)}`); // Expected: ~0.80

// 3. findMostSimilar
const commands = ["install", "uninstall", "update", "init", "info"];
const typo1 = "isntall";
const suggestion1 = findMostSimilar(typo1, commands);
console.log(`\nDid you mean "${suggestion1}" instead of "${typo1}"?`); // Expected: install

// 4. findSimilar
const typo2 = "updaet";
const suggestions2 = findSimilar(typo2, commands, 2);
console.log(`\nDid you mean one of these instead of "${typo2}"?`); // Expected: update
console.log(suggestions2.join(", "));

console.log("\n--- End of Example ---");
