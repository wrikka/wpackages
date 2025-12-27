import { AdvancedPatternMatcher } from "./advanced-matcher";

console.log("--- Advanced Pattern Matcher Usage ---");

// Basic pattern matching
const matcher1 = new AdvancedPatternMatcher(["node_modules/**", "dist/**"]);

console.log("Matcher 1 - Basic patterns:");
console.log("  node_modules/react/index.js:", matcher1.shouldIgnore("node_modules/react/index.js")); // true
console.log("  src/index.ts:", matcher1.shouldIgnore("src/index.ts")); // false

// Negation patterns
const matcher2 = new AdvancedPatternMatcher(["**/*.log", "!important.log"]);

console.log("\nMatcher 2 - Negation patterns:");
console.log("  debug.log:", matcher2.shouldIgnore("debug.log")); // true
console.log("  important.log:", matcher2.shouldIgnore("important.log")); // false

// Complex negation
const matcher3 = new AdvancedPatternMatcher([
	"**/*.spec.ts",
	"!**/__tests__/**/*.spec.ts",
]);

console.log("\nMatcher 3 - Complex negation:");
console.log("  src/app.spec.ts:", matcher3.shouldIgnore("src/app.spec.ts")); // true
console.log("  src/__tests__/app.spec.ts:", matcher3.shouldIgnore("src/__tests__/app.spec.ts")); // false

// Brace expansion
const matcher4 = new AdvancedPatternMatcher(["**/*.{js,ts,tsx}"]); // Note: brace expansion support

console.log("\nMatcher 4 - File type patterns:");
console.log("  src/index.js:", matcher4.matches("src/index.js")); // true
console.log("  src/index.ts:", matcher4.matches("src/index.ts")); // true
console.log("  src/index.css:", matcher4.matches("src/index.css")); // false

// Get patterns
console.log("\nAll patterns in matcher3:", matcher3.getPatterns());
