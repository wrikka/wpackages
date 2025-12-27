/**
 * Usage examples for no-var rule
 */

import type { RuleContext } from "../types";
import { noVar } from "./no-var.rule";

// Example: Detect var declarations
const example1 = () => {
	const context: RuleContext = {
		filename: "legacy.ts",
		sourceCode: `
var count = 0;
var name = "test";
var config = {};
`,
		ast: null,
		options: {},
	};

	const messages = noVar.check(context);
	console.log("Example 1 - Detect var declarations:");
	console.log(`Found ${messages.length} var declaration(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
		if (msg.fix) {
			console.log(`  Auto-fix: Replace with '${msg.fix.text}'`);
		}
	});
};

// Example: Modern code (no var)
const example2 = () => {
	const context: RuleContext = {
		filename: "modern.ts",
		sourceCode: `
const PI = 3.14159;
let counter = 0;
const config = { theme: "dark" };
`,
		ast: null,
		options: {},
	};

	const messages = noVar.check(context);
	console.log("\nExample 2 - Modern code:");
	console.log(`Found ${messages.length} var declaration(s) ✓`);
};

// Run examples
example1();
example2();

console.log("\n💡 Why no var?");
console.log("- var has function scope (confusing)");
console.log("- var can be redeclared (error-prone)");
console.log("- const/let have block scope (safer)");
console.log("- const prevents reassignment (better)");

