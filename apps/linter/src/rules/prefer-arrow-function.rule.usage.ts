/**
 * Usage examples for prefer-arrow-function rule
 */

import type { RuleContext } from "../types";
import { preferArrowFunction } from "./prefer-arrow-function.rule";

// Example: Function expressions
const example1 = () => {
	const context: RuleContext = {
		filename: "legacy.ts",
		sourceCode: `
const add = function(a, b) { // ❌ Function expression
	return a + b;
};

const multiply = function(x, y) { // ❌ Function expression
	return x * y;
};
`,
		ast: null,
		options: {},
	};

	const messages = preferArrowFunction.check(context);
	console.log("Example 1 - Function expressions:");
	console.log(`Found ${messages.length} function expression(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Arrow functions (preferred)
const example2 = () => {
	const context: RuleContext = {
		filename: "modern.ts",
		sourceCode: `
const add = (a: number, b: number) => a + b; // ✓

const multiply = (x: number, y: number) => { // ✓
	return x * y;
};

const process = (data: unknown) => { // ✓
	// Multiple statements
	const result = transform(data);
	return result;
};
`,
		ast: null,
		options: {},
	};

	const messages = preferArrowFunction.check(context);
	console.log("\nExample 2 - Arrow functions:");
	console.log(`Found ${messages.length} function expression(s) ✓`);
};

// Example: Callbacks
const example3 = () => {
	const context: RuleContext = {
		filename: "callbacks.ts",
		sourceCode: `
// ❌ Function expression in callback
setTimeout(function() {
	console.log('timeout');
}, 1000);

// ✓ Arrow function in callback
setTimeout(() => {
	console.log('timeout');
}, 1000);

// ✓ Array methods with arrow functions
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);
const evens = numbers.filter((n) => n % 2 === 0);
`,
		ast: null,
		options: {},
	};

	const messages = preferArrowFunction.check(context);
	console.log("\nExample 3 - Callbacks:");
	console.log(`Found ${messages.length} function expression(s)`);
};

// Run examples
example1();
example2();
example3();

console.log("\n💡 Why prefer arrow functions?");
console.log("- More concise syntax");
console.log("- Lexical 'this' binding (no surprises)");
console.log("- Better for functional programming");
console.log("- Implicit return for single expressions");
console.log("- Standard in modern JavaScript/TypeScript");

