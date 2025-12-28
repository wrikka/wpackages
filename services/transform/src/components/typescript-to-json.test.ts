import { describe, expect, it } from "vitest";
import { TypeScriptToJsonTransformer } from "./typescript-to-json";

describe("TypeScriptToJsonTransformer", () => {
	describe("transform", () => {
		it("should transform TypeScript to JSON AST", () => {
			const code = "const x = 1;";
			const result = TypeScriptToJsonTransformer.transform(code);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
			expect(parsed.body).toBeDefined();
		});

		it("should transform function declaration", () => {
			const code = "function add(a, b) { return a + b; }";
			const result = TypeScriptToJsonTransformer.transform(code);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
			expect(parsed.body.length).toBeGreaterThan(0);
		});

		it("should transform class declaration", () => {
			const code = "class MyClass { constructor() {} }";
			const result = TypeScriptToJsonTransformer.transform(code);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
		});

		it("should support pretty print option", () => {
			const code = "const x = 1;";
			const result = TypeScriptToJsonTransformer.transform(code, { pretty: true, indent: 2 });

			expect(result).toContain("\n");
		});

		it("should support compact output", () => {
			const code = "const x = 1;";
			const result = TypeScriptToJsonTransformer.transform(code, { pretty: false });

			expect(result).not.toContain("\n");
		});

		it("should throw error on invalid TypeScript", () => {
			const code = "const x = ;";

			expect(() => TypeScriptToJsonTransformer.transform(code)).toThrow("Failed to parse TypeScript");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(TypeScriptToJsonTransformer.from).toBe("typescript");
		});

		it("should have correct to format", () => {
			expect(TypeScriptToJsonTransformer.to).toBe("json");
		});
	});

	describe("edge cases", () => {
		it("should handle import statements", () => {
			const code = "import { x } from \"module\";";
			const result = TypeScriptToJsonTransformer.transform(code);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
		});

		it("should handle export statements", () => {
			const code = "export const x = 1;";
			const result = TypeScriptToJsonTransformer.transform(code);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
		});

		it("should handle TypeScript types", () => {
			const code = "const x: number = 1;";
			const result = TypeScriptToJsonTransformer.transform(code);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
		});
	});
});
