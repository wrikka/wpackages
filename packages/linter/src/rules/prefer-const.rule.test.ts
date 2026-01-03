/**
 * Tests for prefer-const rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { preferConst } from "./prefer-const.rule";

describe("preferConst rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect let that could be const", () => {
		const code = `let x = 42;`;
		const messages = preferConst.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("const");
		expect(messages[0]?.message).toContain("x");
	});

	it("should provide fix for let to const", () => {
		const code = `let value = 100;`;
		const messages = preferConst.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.fix).toBeDefined();
		expect(messages[0]?.fix?.text).toBe("const");
	});

	it("should not flag let when variable is reassigned", () => {
		const code = `
let counter = 0;
counter = counter + 1;
counter = 10;
`;
		const messages = preferConst.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should detect multiple lets that could be const", () => {
		const code = `
let a = 1;
let b = 2;
let c = 3;
`;
		const messages = preferConst.check(createContext(code));
		expect(messages).toHaveLength(3);
	});

	it("should not flag variables used in loops", () => {
		const code = `
let sum = 0;
for (let i = 0; i < 10; i = i + 1) {
	sum = sum + i;
}
`;
		const messages = preferConst.check(createContext(code));
		// sum is reassigned, should not be flagged
		expect(messages.filter((m) => m.message.includes("sum"))).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(preferConst.meta.name).toBe("prefer-const");
		expect(preferConst.meta.category).toBe("best-practices");
		expect(preferConst.meta.recommended).toBe(true);
		expect(preferConst.meta.fixable).toBe(true);
	});
});
