/**
 * Tests for prefer-arrow-function rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { preferArrowFunction } from "./prefer-arrow-function.rule";

describe("preferArrowFunction rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect function expression", () => {
		const code = `const add = function(a, b) { return a + b; };`;
		const messages = preferArrowFunction.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("arrow function");
		expect(messages[0]?.severity).toBe("info");
	});

	it("should detect anonymous function", () => {
		const code = `setTimeout(function() { console.log('test'); }, 1000);`;
		const messages = preferArrowFunction.check(createContext(code));
		expect(messages).toHaveLength(1);
	});

	it("should not flag arrow functions", () => {
		const code = `const add = (a, b) => a + b;`;
		const messages = preferArrowFunction.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should not flag function declarations", () => {
		const code = `function add(a, b) { return a + b; }`;
		const messages = preferArrowFunction.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(preferArrowFunction.meta.name).toBe("prefer-arrow-function");
		expect(preferArrowFunction.meta.category).toBe("functional");
		expect(preferArrowFunction.meta.recommended).toBe(true);
		expect(preferArrowFunction.meta.fixable).toBe(false);
	});
});

