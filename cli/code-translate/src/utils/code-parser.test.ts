import { describe, expect, test } from "vitest";
import * as CP from "./code-parser";

describe("code-parser", () => {
	describe("extractImports", () => {
		test("should extract imports from JavaScript", () => {
			const code = `
import React from 'react';
import { useState } from 'react';
const fs = require('fs');
`;
			const imports = CP.extractImports(code);
			expect(imports).toContain("react");
			expect(imports).toContain("fs");
		});

		test("should return empty array for code without imports", () => {
			const code = "const x = 1;";
			const imports = CP.extractImports(code);
			expect(imports).toEqual([]);
		});
	});

	describe("extractComments", () => {
		test("should extract single-line comments", () => {
			const code = "// This is a comment\nconst x = 1;";
			const comments = CP.extractComments(code);
			expect(comments).toContain("// This is a comment");
		});

		test("should extract multi-line comments", () => {
			const code = "/* This is a\nmulti-line comment */\nconst x = 1;";
			const comments = CP.extractComments(code);
			expect(comments).toHaveLength(1);
		});
	});

	describe("removeComments", () => {
		test("should remove all comments", () => {
			const code = "// comment\nconst x = 1; /* another */";
			const result = CP.removeComments(code);
			expect(result).not.toContain("// comment");
			expect(result).not.toContain("/* another */");
			expect(result).toContain("const x = 1;");
		});
	});

	describe("extractFunctions", () => {
		test("should extract function names", () => {
			const code = `
function test() {}
const foo = function() {};
const bar = () => {};
`;
			const functions = CP.extractFunctions(code);
			expect(functions).toContain("test");
			expect(functions).toContain("foo");
			expect(functions).toContain("bar");
		});
	});

	describe("extractClasses", () => {
		test("should extract class names", () => {
			const code = "class MyClass {}\nclass AnotherClass {}";
			const classes = CP.extractClasses(code);
			expect(classes).toContain("MyClass");
			expect(classes).toContain("AnotherClass");
		});
	});

	describe("extractInterfaces", () => {
		test("should extract interface and type names", () => {
			const code = "interface MyInterface {}\ntype MyType = string;";
			const interfaces = CP.extractInterfaces(code);
			expect(interfaces).toContain("MyInterface");
			expect(interfaces).toContain("MyType");
		});
	});

	describe("countLines", () => {
		test("should count lines correctly", () => {
			const code = "line1\nline2\nline3";
			expect(CP.countLines(code)).toBe(3);
		});

		test("should handle empty string", () => {
			expect(CP.countLines("")).toBe(1);
		});
	});

	describe("countCharacters", () => {
		test("should count characters", () => {
			const code = "hello";
			expect(CP.countCharacters(code)).toBe(5);
		});
	});

	describe("countWords", () => {
		test("should count words", () => {
			const code = "hello world test";
			expect(CP.countWords(code)).toBe(3);
		});
	});

	describe("detectIndentation", () => {
		test("should detect spaces", () => {
			const code = "  const x = 1;\n  const y = 2;";
			expect(CP.detectIndentation(code)).toBe("  ");
		});

		test("should detect tabs", () => {
			const code = "\tconst x = 1;\n\tconst y = 2;";
			expect(CP.detectIndentation(code)).toBe("\t");
		});
	});

	describe("normalizeIndentation", () => {
		test("should normalize to spaces", () => {
			const code = "\tconst x = 1;";
			const result = CP.normalizeIndentation(code, "  ");
			expect(result).toBe("  const x = 1;");
		});
	});

	describe("isCodeValid", () => {
		test("should return true for valid code", () => {
			expect(CP.isCodeValid("const x = 1;")).toBe(true);
		});

		test("should return false for empty string", () => {
			expect(CP.isCodeValid("")).toBe(false);
		});

		test("should return false for whitespace only", () => {
			expect(CP.isCodeValid("   ")).toBe(false);
		});
	});

	describe("sanitizeCode", () => {
		test("should trim whitespace", () => {
			const code = "  const x = 1;  ";
			expect(CP.sanitizeCode(code)).toBe("const x = 1;");
		});
	});
});
