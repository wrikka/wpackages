import { describe, expect, it } from "vitest";
import { TypeScriptParser } from "./typescript";

describe("TypeScriptParser", () => {
	describe("parse", () => {
		it("should parse variable declaration", () => {
			const code = "const x = 1;";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body).toBeDefined();
			expect(Array.isArray(result.body)).toBe(true);
		});

		it("should parse function declaration", () => {
			const code = "function add(a, b) { return a + b; }";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse class declaration", () => {
			const code = "class MyClass { constructor() {} }";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse import statement", () => {
			const code = "import { x } from \"module\";";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse export statement", () => {
			const code = "export const x = 1;";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse TypeScript types", () => {
			const code = "const x: number = 1;";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse interface declaration", () => {
			const code = "interface User { name: string; }";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should throw error on invalid TypeScript", () => {
			const code = "const x = ;";

			expect(() => TypeScriptParser.parse(code)).toThrow("Failed to parse TypeScript");
		});

		it("should have sourceType property", () => {
			const code = "const x = 1;";
			const result = TypeScriptParser.parse(code);

			expect(result.sourceType).toBeDefined();
		});
	});

	describe("stringify", () => {
		it("should throw error - not implemented", () => {
			const ast = { type: "Program" as const, body: [], sourceType: "module" };

			expect(() => TypeScriptParser.stringify(ast)).toThrow("TypeScript code generation not yet implemented");
		});
	});

	describe("format property", () => {
		it("should have correct format", () => {
			expect(TypeScriptParser.format).toBe("typescript");
		});
	});

	describe("complex code", () => {
		it("should parse arrow functions", () => {
			const code = "const fn = (x) => x * 2;";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse async/await", () => {
			const code = "async function fetch() { await Promise.resolve(); }";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});

		it("should parse destructuring", () => {
			const code = "const { x, y } = obj;";
			const result = TypeScriptParser.parse(code);

			expect(result.type).toBe("Program");
			expect(result.body.length).toBeGreaterThan(0);
		});
	});
});
