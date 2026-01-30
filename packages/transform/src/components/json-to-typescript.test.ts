import { describe, expect, it } from "vitest";
import { JsonToTypeScriptTransformer } from "./json-to-typescript";

describe("JsonToTypeScriptTransformer", () => {
	it("should transform a simple JSON object to a TypeScript type", () => {
		const json = JSON.stringify({ name: "John", age: 30, active: true });
		const expected = `export type GeneratedType = {\n  name: string;\n  age: number;\n  active: boolean;\n};\n`;
		const result = JsonToTypeScriptTransformer.transform(json, { pretty: false });
		expect(result.trim()).toBe(expected.trim());
	});

	it("should handle nested objects and arrays", () => {
		const json = JSON.stringify({
			user: { name: "Jane", roles: ["admin", "editor"] },
			posts: [{ id: 1, title: "Post 1" }],
		});
		const expected =
			`export type GeneratedType = {\n  user: {\n    name: string;\n    roles: string[];\n  };\n  posts: {\n    id: number;\n    title: string;\n  }[];\n};\n`;
		const result = JsonToTypeScriptTransformer.transform(json, { pretty: false });
		expect(result.trim()).toBe(expected.trim());
	});
});
