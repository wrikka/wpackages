/**
 * Tests for prefer-readonly rule
 */

import { describe, expect, it } from "vitest";
import type { RuleContext } from "../types";
import { preferReadonly } from "./prefer-readonly.rule";

describe("preferReadonly rule", () => {
	const createContext = (
		sourceCode: string,
		filename = "test.ts",
	): RuleContext => ({
		filename,
		sourceCode,
		ast: null,
		options: {},
	});

	it("should detect property that could be readonly", () => {
		const code = `
class User {
	private name: string;
	constructor(name: string) {
		this.name = name;
	}
}
`;
		const messages = preferReadonly.check(createContext(code));
		expect(messages).toHaveLength(1);
		expect(messages[0]?.message).toContain("readonly");
		expect(messages[0]?.message).toContain("name");
	});

	it("should not flag properties that are modified", () => {
		const code = `
class Counter {
	private count: number;
	constructor() {
		this.count = 0;
	}
	increment() {
		this.count = this.count + 1;
	}
}
`;
		const messages = preferReadonly.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should detect multiple readonly candidates", () => {
		const code = `
class Config {
	private apiKey: string;
	private endpoint: string;
	constructor(apiKey: string, endpoint: string) {
		this.apiKey = apiKey;
		this.endpoint = endpoint;
	}
}
`;
		const messages = preferReadonly.check(createContext(code));
		expect(messages.length).toBeGreaterThanOrEqual(2);
	});

	it("should skip JavaScript files", () => {
		const code = `
class User {
	private name: string;
}
`;
		const messages = preferReadonly.check(createContext(code, "test.js"));
		expect(messages).toHaveLength(0);
	});

	it("should not flag properties already marked readonly", () => {
		const code = `
class User {
	private readonly name: string;
	constructor(name: string) {
		this.name = name;
	}
}
`;
		const messages = preferReadonly.check(createContext(code));
		expect(messages).toHaveLength(0);
	});

	it("should have correct metadata", () => {
		expect(preferReadonly.meta.name).toBe("prefer-readonly");
		expect(preferReadonly.meta.category).toBe("typescript");
		expect(preferReadonly.meta.recommended).toBe(true);
		expect(preferReadonly.meta.fixable).toBe(true);
	});
});

