/**
 * Tests for no-mutation rule
 * This is a unique rule for functional programming
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { noMutation } from "./no-mutation.rule";

describe("noMutation rule", () => {
	const createContext = (sourceCode: string): RuleContext => ({
		filename: "test.ts",
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect array.push()", () => {
		const code = `arr.push(item);`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("push");
	});

	it("should detect array.pop()", () => {
		const code = `arr.pop();`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("pop");
	});

	it("should detect array.shift()", () => {
		const code = `arr.shift();`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("shift");
	});

	it("should detect array.unshift()", () => {
		const code = `arr.unshift(item);`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("unshift");
	});

	it("should detect array.splice()", () => {
		const code = `arr.splice(0, 1);`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("splice");
	});

	it("should detect array.sort()", () => {
		const code = `arr.sort();`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("sort");
	});

	it("should detect array.reverse()", () => {
		const code = `arr.reverse();`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("reverse");
	});

	it("should detect increment operator", () => {
		const code = `x++;`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("++");
	});

	it("should detect decrement operator", () => {
		const code = `x--;`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("--");
	});

	it("should detect multiple mutations", () => {
		const code = `
arr.push(1);
arr.pop();
x++;
`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(3);
	});

	it("should not detect immutable operations", () => {
		const code = `
const newArr = [...arr, item];
const y = x + 1;
const z = x - 1;
`;
		const messages = noMutation.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(noMutation.meta.name).toBe("no-mutation");
		expect(noMutation.meta.category).toBe("functional");
		expect(noMutation.meta.recommended).toBe(true);
		expect(noMutation.meta.fixable).toBe(false);
	});
});
