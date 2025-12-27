import { describe, expect, it } from "vitest";
import { noIfElse } from "./no-if-else.rule";

describe("no-if-else", () => {
	it("should detect if-else chains", () => {
		const context = {
			filename: "test.ts",
			sourceCode: `
				if (x === 1) {
					return 'one';
				} else if (x === 2) {
					return 'two';
				}
			`,
			ast: {},
			options: {},
		};

		const messages = noIfElse.check(context);

		expect(messages).toHaveLength(1);
		expect(messages[0]?.ruleId).toBe("no-if-else");
	});

	it("should allow simple if-else", () => {
		const context = {
			filename: "test.ts",
			sourceCode: `
				if (condition) {
					return true;
				} else {
					return false;
				}
			`,
			ast: {},
			options: {},
		};

		const messages = noIfElse.check(context);

		expect(messages).toHaveLength(0);
	});

	it("should allow ternary", () => {
		const context = {
			filename: "test.ts",
			sourceCode: "const result = condition ? 'yes' : 'no';",
			ast: {},
			options: {},
		};

		const messages = noIfElse.check(context);

		expect(messages).toHaveLength(0);
	});
});

