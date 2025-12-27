/**
 * Usage examples for no-debugger rule
 */

import type { RuleContext } from "../types";
import { noDebugger } from "./no-debugger.rule";

// Example: Detect debugger statement
const example1 = () => {
	const context: RuleContext = {
		filename: "app.ts",
		sourceCode: `
function calculateTotal(items: number[]) {
	debugger; // Forgotten debugger statement
	return items.reduce((sum, item) => sum + item, 0);
}
`,
		ast: null,
		options: {},
	};

	const messages = noDebugger.check(context);
	console.log("Example 1 - Debugger detection:");
	console.log(`Found ${messages.length} debugger statement(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
		if (msg.fix) {
			console.log(`  Auto-fixable: Remove debugger`);
		}
	});
};

// Example: Multiple debugger statements
const example2 = () => {
	const context: RuleContext = {
		filename: "debug.ts",
		sourceCode: `
debugger;
const x = 1;
debugger;
const y = 2;
`,
		ast: null,
		options: {},
	};

	const messages = noDebugger.check(context);
	console.log("\nExample 2 - Multiple debuggers:");
	console.log(`Found ${messages.length} debugger statement(s)`);
};

// Example: Clean code (no debuggers)
const example3 = () => {
	const context: RuleContext = {
		filename: "production.ts",
		sourceCode: `
const debug = true;
const debugMode = process.env.DEBUG === "true";

function processData(data: unknown) {
	if (debug) {
		// Use proper logging instead of debugger
	}
	return data;
}
`,
		ast: null,
		options: {},
	};

	const messages = noDebugger.check(context);
	console.log("\nExample 3 - Production code (no debuggers):");
	console.log(`Found ${messages.length} debugger statement(s) ✓`);
};

// Run examples
example1();
example2();
example3();

