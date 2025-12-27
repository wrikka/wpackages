/**
 * Usage examples for no-console rule
 */

import type { RuleContext } from "../types";
import { noConsole } from "./no-console.rule";

// Example: Detect console.log
const example1 = () => {
	const context: RuleContext = {
		filename: "app.ts",
		sourceCode: `
const result = calculateSomething();
console.log(result); // This will be detected
`,
		ast: null,
		options: {},
	};

	const messages = noConsole.check(context);
	console.log("Example 1 - Console.log detection:");
	console.log(`Found ${messages.length} console statement(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Multiple console methods
const example2 = () => {
	const context: RuleContext = {
		filename: "debug.ts",
		sourceCode: `
console.log("Debug info");
console.warn("Warning message");
console.error("Error occurred");
console.info("Information");
`,
		ast: null,
		options: {},
	};

	const messages = noConsole.check(context);
	console.log("\nExample 2 - Multiple console methods:");
	console.log(`Found ${messages.length} console statement(s)`);
};

// Example: No console statements (clean code)
const example3 = () => {
	const context: RuleContext = {
		filename: "clean.ts",
		sourceCode: `
const add = (a: number, b: number) => a + b;
const result = add(2, 3);
return result;
`,
		ast: null,
		options: {},
	};

	const messages = noConsole.check(context);
	console.log("\nExample 3 - Clean code (no console):");
	console.log(`Found ${messages.length} console statement(s)`);
};

// Run examples
example1();
example2();
example3();

