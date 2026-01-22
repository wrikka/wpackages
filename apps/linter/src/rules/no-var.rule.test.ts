/**
 * Tests for no-var rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noVar } from "./no-var.rule";

describe("noVar rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect var declaration", () => {
		const code = `var x = 42;`;
		const messages = noVar.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("var");
		expect(messages[0]?.severity).toBe("error");
	});

	it("should provide fix to replace var with let", () => {
		const code = `var name = "test";`;
		const messages = noVar.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.fix).toBeDefined();
		expect(messages[0]?.fix?.text).toBe("let");
	});

	it("should detect multiple var declarations", () => {
		const code = `
var a = 1;
var b = 2;
var c = 3;
`;
		const messages = noVar.check(createContext(code));
		expect(messages).toHaveLength(3);
	});

	it("should not detect const or let", () => {
		const code = `
const x = 1;
let y = 2;
`;
		const messages = noVar.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noVar.meta.name).toBe("no-var");
		expect(noVar.meta.category).toBe("best-practices");
		expect(noVar.meta.recommended).toBe(true);
		expect(noVar.meta.fixable).toBe(true);
	});
});
