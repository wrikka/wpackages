/**
 * Usage examples for no-explicit-any rule
 */

import type { RuleContext } from "../types";
import { noExplicitAny } from "./no-explicit-any.rule";

// Example: Detect explicit any in variables
const example1 = () => {
	const context: RuleContext = {
		filename: "app.ts",
		sourceCode: `
const data: any = fetchData(); // Bad: using any
const config: any = loadConfig(); // Bad: using any
`,
		ast: null,
		options: {},
	};

	const messages = noExplicitAny.check(context);
	console.log("Example 1 - Explicit any in variables:");
	console.log(`Found ${messages.length} any type(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Detect any in function signatures
const example2 = () => {
	const context: RuleContext = {
		filename: "utils.ts",
		sourceCode: `
function processData(input: any): any {
	return input;
}

function transform(data: any) {
	return data.map((x: any) => x * 2);
}
`,
		ast: null,
		options: {},
	};

	const messages = noExplicitAny.check(context);
	console.log("\nExample 2 - Any in function signatures:");
	console.log(`Found ${messages.length} any type(s)`);
};

// Example: Proper typing (no any)
const example3 = () => {
	const context: RuleContext = {
		filename: "typed.ts",
		sourceCode: `
interface User {
	id: number;
	name: string;
}

function processUser(user: User): User {
	return user;
}

const users: User[] = [];
`,
		ast: null,
		options: {},
	};

	const messages = noExplicitAny.check(context);
	console.log("\nExample 3 - Properly typed code:");
	console.log(`Found ${messages.length} any type(s) ✓`);
};

// Example: JavaScript files are skipped
const example4 = () => {
	const context: RuleContext = {
		filename: "script.js",
		sourceCode: `
const data: any = {}; // This won't be checked in .js files
`,
		ast: null,
		options: {},
	};

	const messages = noExplicitAny.check(context);
	console.log("\nExample 4 - JavaScript files (skipped):");
	console.log(`Found ${messages.length} any type(s) (JS files not checked)`);
};

// Run examples
example1();
example2();
example3();
example4();

