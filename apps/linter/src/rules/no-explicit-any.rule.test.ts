/**
 * Tests for no-explicit-any rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noExplicitAny } from "./no-explicit-any.rule";

describe("noExplicitAny rule", () => {
	const createContext = (
		sourceCode: string,
		filename = "test.ts",
	): RuleContext => ({
		filename,
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect explicit any type", () => {
		const code = `const foo: any = 42;`;
		const messages = noExplicitAny.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("any");
	});

	it("should detect any in function parameters", () => {
		const code = `function process(data: any) { return data; }`;
		const messages = noExplicitAny.check(createContext(code));
		expect(messages).toHaveLength(1);
	});

	it("should detect any in return types", () => {
		const code = `function getData(): any { return {}; }`;
		const messages = noExplicitAny.check(createContext(code));
		expect(messages).toHaveLength(1);
	});

	it("should detect multiple any types", () => {
		const code = `
const a: any = 1;
const b: any = 2;
function test(x: any): any { return x; }
`;
		const messages = noExplicitAny.check(createContext(code));
		expect(messages.length).toBeGreaterThanOrEqual(2);
	});

	it("should skip JavaScript files", () => {
		const code = `const foo: any = 42;`;
		const messages = noExplicitAny.check(createContext(code, "test.js"));
		expect(messages).toHaveLength(0);
	});

	it("should not detect when no any types", () => {
		const code = `
const x: number = 42;
const y: string = "hello";
function add(a: number, b: number): number { return a + b; }
`;
		const messages = noExplicitAny.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noExplicitAny.meta.name).toBe("no-explicit-any");
		expect(noExplicitAny.meta.category).toBe("typescript");
		expect(noExplicitAny.meta.recommended).toBe(true);
		expect(noExplicitAny.meta.fixable).toBe(false);
	});
});
