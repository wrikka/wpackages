/**
 * Usage examples for no-unsafe-eval rule
 * Security-focused examples
 */

import type { RuleContext } from "../types";
import { noUnsafeEval } from "./no-unsafe-eval.rule";

// Example: Detect eval() usage
const example1 = () => {
	const context: RuleContext = {
		filename: "unsafe.ts",
		sourceCode: `
const code = "1 + 1";
const result = eval(code); // ❌ Security risk!
`,
		ast: null,
		options: {},
	};

	const messages = noUnsafeEval.check(context);
	console.log("Example 1 - eval() detection:");
	console.log(`Found ${messages.length} security issue(s)`);
	messages.forEach((msg) => {
		console.log(`  Line ${msg.line}: ${msg.message}`);
		console.log(`  Severity: ${msg.severity}`);
	});
};

// Example: Detect Function constructor
const example2 = () => {
	const context: RuleContext = {
		filename: "dynamic.ts",
		sourceCode: `
// ❌ Dangerous: Code injection risk
const multiply = new Function("a", "b", "return a * b");

// ❌ Also dangerous
const fn = Function("return 42");
`,
		ast: null,
		options: {},
	};

	const messages = noUnsafeEval.check(context);
	console.log("\nExample 2 - Function constructor:");
	console.log(`Found ${messages.length} security issue(s)`);
};

// Example: Unsafe setTimeout/setInterval
const example3 = () => {
	const context: RuleContext = {
		filename: "timers.ts",
		sourceCode: `
// ❌ Unsafe: String as code
setTimeout("alert('test')", 1000);
setInterval("console.log('test')", 1000);

// ✓ Safe: Function callback
setTimeout(() => alert('test'), 1000);
setInterval(() => console.log('test'), 1000);
`,
		ast: null,
		options: {},
	};

	const messages = noUnsafeEval.check(context);
	console.log("\nExample 3 - Unsafe timers:");
	console.log(`Found ${messages.length} security issue(s)`);
};

// Example: Safe alternatives
const example4 = () => {
	const context: RuleContext = {
		filename: "safe.ts",
		sourceCode: `
// ✓ Use proper function calls
const add = (a: number, b: number) => a + b;
const result = add(1, 2);

// ✓ Use function callbacks
setTimeout(() => {
	console.log('Safe execution');
}, 1000);

// ✓ Use proper parsing
const data = JSON.parse('{"key": "value"}');
`,
		ast: null,
		options: {},
	};

	const messages = noUnsafeEval.check(context);
	console.log("\nExample 4 - Safe code:");
	console.log(`Found ${messages.length} security issue(s) ✓`);
};

// Run examples
example1();
example2();
example3();
example4();

console.log("\n🔒 Security Tips:");
console.log("- Never use eval() - it's a major security risk");
console.log("- Avoid Function constructor - similar to eval");
console.log("- Use function callbacks instead of string code");
console.log("- Validate and sanitize all user input");

