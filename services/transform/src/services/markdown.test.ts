import { describe, expect, it } from "vitest";
import { MarkdownParser } from "./markdown";

describe("MarkdownParser", () => {
	describe("parse", () => {
		it("should parse heading", () => {
			const markdown = "# Hello World";
			const result = MarkdownParser.parse(markdown);

			expect(result.type).toBe("root");
			expect(result.children.length).toBeGreaterThan(0);
		});

		it("should parse paragraph", () => {
			const markdown = "This is a paragraph";
			const result = MarkdownParser.parse(markdown);

			expect(result.type).toBe("root");
			expect(result.children.length).toBeGreaterThan(0);
		});

		it("should parse list", () => {
			const markdown = "- Item 1\n- Item 2\n- Item 3";
			const result = MarkdownParser.parse(markdown);

			expect(result.type).toBe("root");
			expect(result.children.length).toBeGreaterThan(0);
		});

		it("should parse code block", () => {
			const markdown = "```javascript\nconst x = 1;\n```";
			const result = MarkdownParser.parse(markdown);

			expect(result.type).toBe("root");
			expect(result.children.length).toBeGreaterThan(0);
		});

		it("should parse table", () => {
			const markdown = "| Name | Age |\n| --- | --- |\n| Alice | 30 |";
			const result = MarkdownParser.parse(markdown);

			expect(result.type).toBe("root");
			expect(result.children.length).toBeGreaterThan(0);
		});

		it("should parse inline formatting", () => {
			const markdown = "**bold** and *italic*";
			const result = MarkdownParser.parse(markdown);

			expect(result.type).toBe("root");
			expect(result.children.length).toBeGreaterThan(0);
		});

		it("should throw error on invalid markdown", () => {
			expect(() => MarkdownParser.parse(null as any)).toThrow("Failed to parse Markdown");
		});
	});

	describe("stringify", () => {
		it("should stringify parsed markdown", () => {
			const markdown = "# Heading\nParagraph text";
			const ast = MarkdownParser.parse(markdown);
			const result = MarkdownParser.stringify(ast);

			expect(result).toBeTruthy();
			expect(typeof result).toBe("string");
		});

		it("should reconstruct heading", () => {
			const markdown = "# Hello\n## World";
			const ast = MarkdownParser.parse(markdown);
			const result = MarkdownParser.stringify(ast);

			expect(result).toContain("#");
		});

		it("should handle empty AST", () => {
			const ast = { type: "root" as const, children: [] };
			const result = MarkdownParser.stringify(ast);

			expect(result).toBe("");
		});

		it("should throw error on invalid AST", () => {
			expect(() => MarkdownParser.stringify(null as any)).toThrow("Failed to stringify Markdown");
		});
	});

	describe("format property", () => {
		it("should have correct format", () => {
			expect(MarkdownParser.format).toBe("markdown");
		});
	});

	describe("round-trip", () => {
		it("should parse and stringify markdown", () => {
			const markdown = "# Title\n\nSome content";
			const ast = MarkdownParser.parse(markdown);
			const result = MarkdownParser.stringify(ast);

			expect(result).toBeTruthy();
		});
	});
});
