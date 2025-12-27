/**
 * Tests for no-debugger rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noDebugger } from "./no-debugger.rule";

describe("noDebugger rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect debugger statement", () => {
		const code = `
const x = 42;
debugger;
console.log(x);
`;
		const messages = noDebugger.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("debugger");
		expect(messages[0]?.severity).toBe("error");
	});

	it("should detect multiple debugger statements", () => {
		const code = `
debugger;
const x = 1;
debugger;
`;
		const messages = noDebugger.check(createContext(code));
		expect(messages).toHaveLength(2);
	});

	it("should provide fix for debugger statement", () => {
		const code = `debugger;`;
		const messages = noDebugger.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.fix).toBeDefined();
		expect(messages[0]?.fix?.text).toBe("");
	});

	it("should not detect when no debugger statements", () => {
		const code = `
const debug = true;
const debugMode = false;
`;
		const messages = noDebugger.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noDebugger.meta.name).toBe("no-debugger");
		expect(noDebugger.meta.category).toBe("errors");
		expect(noDebugger.meta.recommended).toBe(true);
		expect(noDebugger.meta.fixable).toBe(true);
	});
});

