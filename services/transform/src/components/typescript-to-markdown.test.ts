import { describe, expect, it } from "vitest";
import { TypeScriptToMarkdownTransformer } from "./typescript-to-markdown";

describe("TypeScriptToMarkdownTransformer", () => {
	describe("transform", () => {
		it("should wrap TypeScript code in markdown code block", () => {
			const code = "const x: number = 10;";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toBe("```typescript\nconst x: number = 10;\n```");
		});

		it("should handle function declarations", () => {
			const code = "function add(a: number, b: number): number { return a + b; }";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("```typescript");
			expect(result).toContain("function add");
		});

		it("should handle class declarations", () => {
			const code = "class MyClass { constructor() {} }";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("```typescript");
			expect(result).toContain("class MyClass");
		});

		it("should handle import statements", () => {
			const code = 'import { x } from "module";';
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("```typescript");
			expect(result).toContain("import");
		});

		it("should handle multiline code", () => {
			const code = "const x = 1;\nconst y = 2;\nconst z = x + y;";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("```typescript");
			expect(result).toContain("const x = 1;");
			expect(result).toContain("const y = 2;");
		});

		it("should preserve code formatting", () => {
			const code = "const obj = {\n  name: 'test',\n  value: 123\n};";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("```typescript");
			expect(result).toContain("name: 'test'");
		});

		it("should handle empty code", () => {
			const code = "";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toBe("```typescript\n\n```");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(TypeScriptToMarkdownTransformer.from).toBe("typescript");
		});

		it("should have correct to format", () => {
			expect(TypeScriptToMarkdownTransformer.to).toBe("markdown");
		});
	});

	describe("edge cases", () => {
		it("should handle code with backticks", () => {
			const code = "const template = `hello ${name}`;";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("```typescript");
		});

		it("should handle async/await", () => {
			const code = "async function fetch() { await Promise.resolve(); }";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("async");
		});

		it("should handle arrow functions", () => {
			const code = "const fn = (x: number) => x * 2;";
			const result = TypeScriptToMarkdownTransformer.transform(code);

			expect(result).toContain("=>");
		});
	});
});
