import { describe, expect, it } from "vitest";
import { noClass } from "./no-class.rule";

describe("no-class", () => {
	it("should detect class declarations", () => {
		const context = {
			filename: "test.ts",
			sourceCode: "class User { name: string; }",
			ast: {},
			options: {},
		};

		const messages = noClass.check(context);

		expect(messages).toHaveLength(1);
		expect(messages[0]?.ruleId).toBe("no-class");
		expect(messages[0]?.message).toContain("User");
	});

	it("should allow code without classes", () => {
		const context = {
			filename: "test.ts",
			sourceCode: "const user = { name: 'John' };",
			ast: {},
			options: {},
		};

		const messages = noClass.check(context);

		expect(messages).toHaveLength(0);
	});

	it("should detect multiple classes", () => {
		const context = {
			filename: "test.ts",
			sourceCode: `
				class User { }
				class Admin { }
			`,
			ast: {},
			options: {},
		};

		const messages = noClass.check(context);

		expect(messages).toHaveLength(2);
	});
});

