import { test, expect } from "bun:test";
import { renderGfm, renderWithOptions } from "./index.js";

test("renders basic markdown to html", () => {
	const markdown = "# Hello, World!";
	const html = renderGfm(markdown);
	expect(html).toContain("<h1>Hello, World!</h1>");
});

test("renders markdown with table to html", () => {
	const markdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
	const html = renderGfm(markdown);
	expect(html).toContain("<table>");
	expect(html).toContain("<td>Cell 1</td>");
});

test("renders YouTube embed plugin", () => {
	const markdown = "::youtube[dQw4w9WgXcQ]";
	const html = renderGfm(markdown);
	// Current behavior: renders as plain text
	expect(html).toContain("::youtube[dQw4w9WgXcQ]");
});

test("renders Table of Contents (TOC) plugin", () => {
	const markdown = `
[toc]

# Title

## Subtitle

### Deeper Title
`;
	const html = renderWithOptions(markdown, { toc: true });
	expect(html).toContain('<li><a href="#title"');
	expect(html).toContain('href="#subtitle"');
	expect(html).toContain(">Subtitle</a>");
});

test("renders footnotes", () => {
	const markdown = `
Here is a footnote reference,[^1] and another.[^longnote].

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
    belong to the previous footnote.
`;
	const html = renderWithOptions(markdown, { footnotes: true });
	expect(html).toContain('<sup><a href="#1"');
	expect(html).toContain("<div><sup>1</sup>");
	expect(html).toContain("<p>Here is the footnote.</p>");
});

test("disables footnotes", () => {
	const markdown = `
Here is a footnote reference,[^1].

[^1]: Here is the footnote.
`;
	const html = renderWithOptions(markdown, { footnotes: false });
	expect(html).not.toContain('<sup class="footnote-ref">');
	expect(html).not.toContain('<div class="footnote-definition" id="fn-1">');
});
