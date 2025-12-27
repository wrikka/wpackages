/**
 * Usage examples for prefer-readonly rule
 * TypeScript-specific immutability patterns
 */

import type { RuleContext } from "../types";
import { preferReadonly } from "./prefer-readonly.rule";

// Example: Detect properties that should be readonly
const example1 = () => {
	const context: RuleContext = {
		filename: "user.ts",
		sourceCode: `
class User {
	private id: number; // Should be readonly
	private email: string; // Should be readonly
	
	constructor(id: number, email: string) {
		this.id = id;
		this.email = email;
	}
}
`,
		ast: null,
		options: {},
	};

	const messages = preferReadonly.check(context);
	console.log("Example 1 - Properties that should be readonly:");
	console.log(`Found ${messages.length} property/properties`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
	});
};

// Example: Correct usage - mutable properties
const example2 = () => {
	const context: RuleContext = {
		filename: "counter.ts",
		sourceCode: `
class Counter {
	private count: number; // Correctly not readonly
	
	constructor() {
		this.count = 0;
	}
	
	increment() {
		this.count = this.count + 1; // Modified after construction
	}
	
	reset() {
		this.count = 0; // Modified after construction
	}
}
`,
		ast: null,
		options: {},
	};

	const messages = preferReadonly.check(context);
	console.log("\nExample 2 - Mutable properties (correct):");
	console.log(`Found ${messages.length} property/properties ✓`);
};

// Example: Best practice with readonly
const example3 = () => {
	const context: RuleContext = {
		filename: "config.ts",
		sourceCode: `
class AppConfig {
	private readonly apiUrl: string;
	private readonly apiKey: string;
	private readonly timeout: number;
	
	constructor(apiUrl: string, apiKey: string, timeout: number) {
		this.apiUrl = apiUrl;
		this.apiKey = apiKey;
		this.timeout = timeout;
	}
	
	// No methods modify these properties
	getApiUrl() {
		return this.apiUrl;
	}
}
`,
		ast: null,
		options: {},
	};

	const messages = preferReadonly.check(context);
	console.log("\nExample 3 - Best practice (all readonly):");
	console.log(`Found ${messages.length} issue(s) ✓`);
};

// Example: Mixed - some readonly, some mutable
const example4 = () => {
	const context: RuleContext = {
		filename: "shopping-cart.ts",
		sourceCode: `
class ShoppingCart {
	private readonly userId: string; // Immutable
	private items: Item[]; // Mutable
	
	constructor(userId: string) {
		this.userId = userId;
		this.items = [];
	}
	
	addItem(item: Item) {
		this.items = [...this.items, item]; // Modified
	}
}
`,
		ast: null,
		options: {},
	};

	const messages = preferReadonly.check(context);
	console.log("\nExample 4 - Mixed readonly/mutable:");
	console.log(
		`Found ${messages.length} property/properties that could be readonly`,
	);
};

// Run examples
example1();
example2();
example3();
example4();

console.log("\n💡 Tips:");
console.log("- Mark properties readonly when they're only set in constructor");
console.log("- readonly prevents accidental modification");
console.log("- Improves type safety and code clarity");
console.log("- Makes intent explicit - this value won't change");

