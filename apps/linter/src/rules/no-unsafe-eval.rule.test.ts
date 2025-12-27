/**
 * Tests for no-unsafe-eval rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noUnsafeEval } from "./no-unsafe-eval.rule";

describe("noUnsafeEval rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect eval()", () => {
		const code = `eval("alert('test')");`;
		const messages = noUnsafeEval.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("eval");
		expect(messages[0]?.severity).toBe("error");
	});

	it("should detect Function constructor", () => {
		const code = `const fn = new Function("return 42");`;
		const messages = noUnsafeEval.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("Function");
	});

	it("should detect setTimeout with string", () => {
		const code = `setTimeout("alert('test')", 1000);`;
		const messages = noUnsafeEval.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("setTimeout");
	});

	it("should detect setInterval with string", () => {
		const code = `setInterval("console.log('test')", 1000);`;
		const messages = noUnsafeEval.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("setInterval");
	});

	it("should detect multiple unsafe patterns", () => {
		const code = `
eval("1 + 1");
new Function("x", "return x * 2");
setTimeout("alert(1)", 100);
`;
		const messages = noUnsafeEval.check(createContext(code));
		expect(messages).toHaveLength(3);
	});

	it("should not detect safe setTimeout/setInterval", () => {
		const code = `
setTimeout(() => console.log('safe'), 1000);
setInterval(() => console.log('safe'), 1000);
`;
		const messages = noUnsafeEval.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noUnsafeEval.meta.name).toBe("no-eval");
		expect(noUnsafeEval.meta.category).toBe("security");
		expect(noUnsafeEval.meta.recommended).toBe(true);
		expect(noUnsafeEval.meta.fixable).toBe(false);
	});
});

