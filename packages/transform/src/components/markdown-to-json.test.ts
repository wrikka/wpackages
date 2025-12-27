import { describe, expect, it } from "vitest";
import { MarkdownToJsonTransformer } from "./markdown-to-json";

describe("MarkdownToJsonTransformer", () => {
	describe("transform", () => {
		it("should transform markdown to JSON AST", () => {
			const markdown = "# Hello World";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
			expect(parsed.children).toBeDefined();
		});

		it("should transform markdown with paragraphs", () => {
			const markdown = "This is a paragraph\n\nAnother paragraph";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
			expect(Array.isArray(parsed.children)).toBe(true);
		});

		it("should transform markdown with lists", () => {
			const markdown = "- Item 1\n- Item 2\n- Item 3";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
			expect(parsed.children.length).toBeGreaterThan(0);
		});

		it("should transform markdown with code blocks", () => {
			const markdown = "```javascript\nconst x = 1;\n```";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
		});

		it("should support pretty print option", () => {
			const markdown = "# Title";
			const result = MarkdownToJsonTransformer.transform(markdown, { pretty: true, indent: 2 });

			expect(result).toContain("\n");
		});

		it("should support compact output", () => {
			const markdown = "# Title";
			const result = MarkdownToJsonTransformer.transform(markdown, { pretty: false });

			expect(result).not.toContain("\n");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(MarkdownToJsonTransformer.from).toBe("markdown");
		});

		it("should have correct to format", () => {
			expect(MarkdownToJsonTransformer.to).toBe("json");
		});
	});

	describe("edge cases", () => {
		it("should handle empty markdown", () => {
			const markdown = "";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
		});

		it("should handle markdown with inline formatting", () => {
			const markdown = "**bold** and *italic* text";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
		});

		it("should handle markdown with links", () => {
			const markdown = "[Link](https://example.com)";
			const result = MarkdownToJsonTransformer.transform(markdown);
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
		});
	});
});
