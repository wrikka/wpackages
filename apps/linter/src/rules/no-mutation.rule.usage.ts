/**
 * Usage examples for no-mutation rule
 * Demonstrates functional programming patterns
 */

import type { RuleContext } from "../types";
import { noMutation } from "./no-mutation.rule";

// Example: Detect array mutations
const example1 = () => {
	const context: RuleContext = {
		filename: "mutations.ts",
		sourceCode: `
const items = [1, 2, 3];
items.push(4); // ❌ Mutation
items.pop(); // ❌ Mutation
items.sort(); // ❌ Mutation
`,
		ast: null,
		options: {},
	};

	const messages = noMutation.check(context);
	console.log("Example 1 - Array mutations:");
	console.log(`Found ${messages.length} mutation(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Immutable alternatives
const example2 = () => {
	const context: RuleContext = {
		filename: "immutable.ts",
		sourceCode: `
const items = [1, 2, 3];
const added = [...items, 4]; // ✓ Immutable
const removed = items.slice(0, -1); // ✓ Immutable
const sorted = [...items].sort(); // ✓ Immutable
const reversed = items.toReversed(); // ✓ Immutable (ES2023)
`,
		ast: null,
		options: {},
	};

	const messages = noMutation.check(context);
	console.log("\nExample 2 - Immutable alternatives:");
	console.log(`Found ${messages.length} mutation(s) ✓`);
};

// Example: Detect increment/decrement
const example3 = () => {
	const context: RuleContext = {
		filename: "counters.ts",
		sourceCode: `
let count = 0;
count++; // ❌ Mutation
count--; // ❌ Mutation

// Better alternatives:
const newCount = count + 1; // ✓ Immutable
const decremented = count - 1; // ✓ Immutable
`,
		ast: null,
		options: {},
	};

	const messages = noMutation.check(context);
	console.log("\nExample 3 - Increment/Decrement:");
	console.log(`Found ${messages.length} mutation(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Complex mutations
const example4 = () => {
	const context: RuleContext = {
		filename: "complex.ts",
		sourceCode: `
const users = [{ id: 1 }, { id: 2 }];
users.splice(0, 1); // ❌ Mutation
users.unshift({ id: 0 }); // ❌ Mutation

// Immutable alternatives:
const filtered = users.filter((u) => u.id !== 1); // ✓
const prepended = [{ id: 0 }, ...users]; // ✓
`,
		ast: null,
		options: {},
	};

	const messages = noMutation.check(context);
	console.log("\nExample 4 - Complex mutations:");
	console.log(`Found ${messages.length} mutation(s)`);
};

// Run examples
example1();
example2();
example3();
example4();

console.log("\n💡 Tips:");
console.log("- Use spread [...arr] for array operations");
console.log("- Use toSorted(), toReversed() (ES2023)");
console.log("- Use slice(), filter(), map() instead of mutating methods");
console.log("- Use x + 1 instead of x++");

