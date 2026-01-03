/**
 * Usage examples for no-null rule
 * Functional programming best practice
 */

import type { RuleContext } from "../types";
import { noNull } from "./no-null.rule";

// Example: Detect null usage
const example1 = () => {
	const context: RuleContext = {
		filename: "api.ts",
		sourceCode: `
function findUser(id: number) {
	if (!exists(id)) {
		return null; // ❌ Avoid null
	}
	return user;
}

const result = null; // ❌ Avoid null
`,
		ast: null,
		options: {},
	};

	const messages = noNull.check(context);
	console.log("Example 1 - Detect null usage:");
	console.log(`Found ${messages.length} null usage(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Functional alternative
const example2 = () => {
	const context: RuleContext = {
		filename: "functional.ts",
		sourceCode: `
function findUser(id: number): User | undefined {
	if (!exists(id)) {
		return undefined; // ✓ Use undefined
	}
	return user;
}

const result: string | undefined = undefined; // ✓
`,
		ast: null,
		options: {},
	};

	const messages = noNull.check(context);
	console.log("\nExample 2 - Functional approach:");
	console.log(`Found ${messages.length} null usage(s) ✓`);
};

// Example: Option type pattern
const example3 = () => {
	const context: RuleContext = {
		filename: "option.ts",
		sourceCode: `
type Option<T> = T | undefined;

const getValue = (): Option<string> => {
	return undefined; // ✓ Better than null
};

const processValue = (val: Option<number>) => {
	if (val === undefined) {
		return 0;
	}
	return val * 2;
};
`,
		ast: null,
		options: {},
	};

	const messages = noNull.check(context);
	console.log("\nExample 3 - Option type pattern:");
	console.log(`Found ${messages.length} null usage(s) ✓`);
};

// Run examples
example1();
example2();
example3();

console.log("\n💡 Why avoid null?");
console.log("- undefined is the default 'missing value' in JS/TS");
console.log("- Simpler type checking (just check for undefined)");
console.log("- null is a legacy feature from Java");
console.log("- Functional programming prefers Option<T> = T | undefined");
console.log("- Avoids null vs undefined confusion");
