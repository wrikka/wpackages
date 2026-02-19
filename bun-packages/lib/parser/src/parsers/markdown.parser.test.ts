/**
 * Markdown Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { markdownParser, markdownToHTML, parseMarkdown } from "./markdown.parser";

describe("Markdown Parser", () => {
	describe("parseMarkdown", () => {
		it("should parse simple markdown", () => {
			expect.assertions(3);
			const md = "# Hello\n\nWorld";
			const result = parseMarkdown(md, "test.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const html = result.value.data;
				expect(html).toMatch(/<h1.*>Hello<\/h1>/);
				expect(html).toContain("<p>World</p>");
			}
		});

		it("should parse headings to HTML", () => {
			expect.assertions(4);
			const md = "# H1\n## H2\n### H3";
			const result = parseMarkdown(md, "headings.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const html = result.value.data;
				expect(html).toMatch(/<h1.*>H1<\/h1>/);
				expect(html).toMatch(/<h2.*>H2<\/h2>/);
				expect(html).toMatch(/<h3.*>H3<\/h3>/);
			}
		});

		it("should parse lists to HTML", () => {
			expect.assertions(3);
			const md = "- Item 1\n- Item 2";
			const result = parseMarkdown(md, "lists.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const html = result.value.data;
				expect(html).toContain("<ul>");
				expect(html).toContain("<li>Item 1</li>");
			}
		});

		it("should parse code blocks to HTML", () => {
			expect.assertions(2);
			const md = "```js\nconsole.log('hello');\n```";
			const result = parseMarkdown(md, "code.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const html = result.value.data;
				expect(html).toContain("<pre><code class=\"language-js\">");
			}
		});

		it("should parse GFM tables to HTML", () => {
			expect.assertions(3);
			const md = "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |";
			const result = parseMarkdown(md, "table.md"); // markdown-wasm enables GFM by default
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const html = result.value.data;
				expect(html).toContain("<table>");
				expect(html).toContain("<th>Header 1</th>");
			}
		});

		it("should handle empty markdown", () => {
			expect.assertions(2);
			const result = parseMarkdown("", "empty.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toBe("");
			}
		});

		it("should include metadata", () => {
			expect.assertions(4);
			const md = "# Test";
			const result = parseMarkdown(md, "meta.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.metadata).toBeDefined();
				expect(result.value.metadata?.filename).toBe("meta.md");
				// tokenCount is no longer applicable with markdown-wasm
				expect(result.value.metadata).not.toHaveProperty("tokenCount");
			}
		});
	});

	describe("markdownToHTML", () => {
		it("should convert markdown to HTML", () => {
			expect.assertions(4);
			const md = "# Hello\n\nWorld";
			const html = markdownToHTML(md);
			expect(html).toContain("<h1");
			expect(html).toContain("Hello");
			expect(html).toContain("<p>");
			expect(html).toContain("World");
		});

		it("should convert lists to HTML", () => {
			const md = "- Item 1\n- Item 2";
			const html = markdownToHTML(md);
			expect(html).toContain("<ul>");
			expect(html).toContain("<li>");
		});

		it("should convert code blocks to HTML", () => {
			const md = "```javascript\nconst x = 42;\n```";
			const html = markdownToHTML(md);
			expect(html).toContain("<code");
			expect(html).toContain("const x = 42");
		});

		it("should convert links to HTML", () => {
			const md = "[Link](https://example.com)";
			const html = markdownToHTML(md);
			expect(html).toContain("<a href");
			expect(html).toContain("https://example.com");
		});
	});

	describe("markdownParser", () => {
		it("should have correct metadata", () => {
			expect(markdownParser.name).toBe("markdown");
			expect(markdownParser.supportedLanguages).toContain("markdown");
		});

		it("should parse through parser instance", () => {
			const result = markdownParser.parse("# Test", "test.md");
			expect(Result.isOk(result)).toBe(true);
		});
	});
});
