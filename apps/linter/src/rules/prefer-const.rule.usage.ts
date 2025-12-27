/**
 * Usage examples for prefer-const rule
 */

import type { RuleContext } from "../types";
import { preferConst } from "./prefer-const.rule";

// Example: Detect let that should be const
const example1 = () => {
	const context: RuleContext = {
		filename: "variables.ts",
		sourceCode: `
let name = "John"; // Should be const
let age = 30; // Should be const
let city = "Tokyo"; // Should be const
`,
		ast: null,
		options: {},
	};

	const messages = preferConst.check(context);
	console.log("Example 1 - let should be const:");
	console.log(`Found ${messages.length} variable(s) that could be const`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
		if (msg.fix) {
			console.log(`  Auto-fixable: ${msg.fix.text}`);
		}
	});
};

// Example: Correct usage of let (reassignment)
const example2 = () => {
	const context: RuleContext = {
		filename: "counters.ts",
		sourceCode: `
let counter = 0;
counter = counter + 1; // Reassigned
counter = counter * 2; // Reassigned again

let sum = 0;
for (let i = 0; i < 10; i = i + 1) {
	sum = sum + i; // Reassigned in loop
}
`,
		ast: null,
		options: {},
	};

	const messages = preferConst.check(context);
	console.log("\nExample 2 - Correct let usage (reassigned):");
	console.log(`Found ${messages.length} variable(s) that could be const`);
};

// Example: Mixed usage
const example3 = () => {
	const context: RuleContext = {
		filename: "mixed.ts",
		sourceCode: `
let config = loadConfig(); // Should be const
let data = fetchData(); // Should be const

let total = 0;
total = calculateTotal(data); // Reassigned, let is correct
`,
		ast: null,
		options: {},
	};

	const messages = preferConst.check(context);
	console.log("\nExample 3 - Mixed usage:");
	console.log(`Found ${messages.length} variable(s) that could be const`);
	messages.forEach((msg) => {
		console.log(`  ${msg.message}`);
	});
};

// Example: Best practice with const
const example4 = () => {
	const context: RuleContext = {
		filename: "best-practice.ts",
		sourceCode: `
const name = "Alice";
const age = 25;
const settings = { theme: "dark" };

// Use let only when reassignment is needed
let mutableValue = 0;
mutableValue = compute();
mutableValue = transform(mutableValue);
`,
		ast: null,
		options: {},
	};

	const messages = preferConst.check(context);
	console.log("\nExample 4 - Best practice:");
	console.log(`Found ${messages.length} issue(s) ✓`);
};

// Run examples
example1();
example2();
example3();
example4();

console.log("\n💡 Tips:");
console.log("- Use const by default");
console.log("- Use let only when reassignment is needed");
console.log("- const prevents accidental reassignment");
console.log("- Makes code more predictable and easier to reason about");

