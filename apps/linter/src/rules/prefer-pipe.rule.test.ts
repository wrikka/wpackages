import { describe, expect, it } from "vitest";
import { preferPipe } from "./prefer-pipe.rule";

describe("prefer-pipe", () => {
	it("should detect nested function calls", () => {
		const context = {
			filename: "test.ts",
			sourceCode: "const result = f(g(h(x)));",
			ast: {},
			options: {},
		};

		const messages = preferPipe.check(context);

		expect(messages).toHaveLength(1);
		expect(messages[0]?.ruleId).toBe("prefer-pipe");
		expect(messages[0]?.severity).toBe("info");
	});

	it("should allow simple function calls", () => {
		const context = {
			filename: "test.ts",
			sourceCode: "const result = f(x);",
			ast: {},
			options: {},
		};

		const messages = preferPipe.check(context);

		expect(messages).toHaveLength(0);
	});

	it("should allow pipe usage", () => {
		const context = {
			filename: "test.ts",
			sourceCode: "const result = pipe(x, h, g, f);",
			ast: {},
			options: {},
		};

		const messages = preferPipe.check(context);

		expect(messages).toHaveLength(0);
	});
});

