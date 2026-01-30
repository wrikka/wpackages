/**
 * Tests for no-null rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noNull } from "./no-null.rule";

describe("noNull rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect null value", () => {
		const code = `const value = null;`;
		const messages = noNull.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("null");
		expect(messages[0]?.severity).toBe("warning");
	});

	it("should detect null in return statement", () => {
		const code = `return null;`;
		const messages = noNull.check(createContext(code));
		expect(messages).toHaveLength(1);
	});

	it("should detect multiple null usages", () => {
		const code = `
const a = null;
const b = null;
return null;
`;
		const messages = noNull.check(createContext(code));
		expect(messages).toHaveLength(3);
	});

	it("should not flag undefined", () => {
		const code = `
const value = undefined;
return undefined;
`;
		const messages = noNull.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noNull.meta.name).toBe("no-null");
		expect(noNull.meta.category).toBe("functional");
		expect(noNull.meta.recommended).toBe(true);
		expect(noNull.meta.fixable).toBe(false);
	});
});
