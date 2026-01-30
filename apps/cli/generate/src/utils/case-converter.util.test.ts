import { describe, expect, it } from "vitest";
import {
	convertCase,
	toCamelCase,
	toConstantCase,
	toKebabCase,
	toPascalCase,
	toSnakeCase,
} from "./case-converter.util";

describe("case-converter utils", () => {
	describe("toPascalCase", () => {
		it("should convert to PascalCase", () => {
			expect(toPascalCase("hello world")).toBe("HelloWorld");
			expect(toPascalCase("helloWorld")).toBe("HelloWorld");
			expect(toPascalCase("hello-world")).toBe("HelloWorld");
			expect(toPascalCase("hello_world")).toBe("HelloWorld");
		});

		it("should preserve acronyms when option is set", () => {
			expect(toPascalCase("API response", { preserveAcronyms: true })).toBe(
				"APIResponse",
			);
		});
	});

	describe("toCamelCase", () => {
		it("should convert to camelCase", () => {
			expect(toCamelCase("hello world")).toBe("helloWorld");
			expect(toCamelCase("HelloWorld")).toBe("helloWorld");
			expect(toCamelCase("hello-world")).toBe("helloWorld");
		});
	});

	describe("toKebabCase", () => {
		it("should convert to kebab-case", () => {
			expect(toKebabCase("hello world")).toBe("hello-world");
			expect(toKebabCase("HelloWorld")).toBe("hello-world");
			expect(toKebabCase("helloWorld")).toBe("hello-world");
		});
	});

	describe("toSnakeCase", () => {
		it("should convert to snake_case", () => {
			expect(toSnakeCase("hello world")).toBe("hello_world");
			expect(toSnakeCase("HelloWorld")).toBe("hello_world");
			expect(toSnakeCase("hello-world")).toBe("hello_world");
		});
	});

	describe("toConstantCase", () => {
		it("should convert to CONSTANT_CASE", () => {
			expect(toConstantCase("hello world")).toBe("HELLO_WORLD");
			expect(toConstantCase("helloWorld")).toBe("HELLO_WORLD");
			expect(toConstantCase("hello-world")).toBe("HELLO_WORLD");
		});
	});

	describe("convertCase", () => {
		it("should convert to specified case style", () => {
			expect(convertCase("hello world", "pascal")).toBe("HelloWorld");
			expect(convertCase("hello world", "camel")).toBe("helloWorld");
			expect(convertCase("hello world", "kebab")).toBe("hello-world");
			expect(convertCase("hello world", "snake")).toBe("hello_world");
			expect(convertCase("hello world", "constant")).toBe("HELLO_WORLD");
			expect(convertCase("hello world", "lower")).toBe("hello world");
			expect(convertCase("hello world", "upper")).toBe("HELLO WORLD");
		});
	});
});
