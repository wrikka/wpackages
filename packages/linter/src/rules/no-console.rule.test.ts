/**
 * Tests for no-console rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noConsole } from "./no-console.rule";

describe("noConsole rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect console.log", () => {
		const code = `
const x = 42;
console.log(x);
`;
		const messages = noConsole.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("console.log");
	});

	it("should detect console.warn", () => {
		const code = `console.warn("warning");`;
		const messages = noConsole.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("console.warn");
	});

	it("should detect console.error", () => {
		const code = `console.error("error");`;
		const messages = noConsole.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("console.error");
	});

	it("should detect multiple console statements", () => {
		const code = `
console.log("test");
console.warn("test");
console.error("test");
`;
		const messages = noConsole.check(createContext(code));
		expect(messages).toHaveLength(3);
	});

	it("should not detect when no console statements", () => {
		const code = `
const x = 42;
const y = x + 1;
`;
		const messages = noConsole.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noConsole.meta.name).toBe("no-console");
		expect(noConsole.meta.category).toBe("best-practices");
		expect(noConsole.meta.recommended).toBe(true);
		expect(noConsole.meta.fixable).toBe(false);
	});
});
