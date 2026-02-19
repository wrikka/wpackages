/**
 * Markdown Parser usage examples
 */

import { Result } from "../utils";
import { markdownToHTML, parseMarkdown } from "./markdown.parser";

// === Basic Usage ===
console.log("=== Markdown Parser Usage Examples ===\n");

// 1. Parse simple markdown
const simpleMD = `
# Hello World

This is a **simple** markdown document.
`;
const simpleResult = parseMarkdown(simpleMD, "simple.md");
if (Result.isOk(simpleResult)) {
	console.log("✓ Simple markdown parsed:");
	console.log("  Tokens:", simpleResult.value.data.length);
	console.log("  Language:", simpleResult.value.language);
}

// 2. Parse markdown with various elements
const complexMD = `
# Main Title

## Section 1

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
- List item 3

### Code Example

\`\`\`javascript
const greet = (name) => {
  console.log(\`Hello, \${name}!\`);
};
\`\`\`

## Section 2

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

> This is a blockquote

[Link to example](https://example.com)

![Image](image.png)
`;
const complexResult = parseMarkdown(complexMD, "complex.md");
if (Result.isOk(complexResult)) {
	console.log("\n✓ Complex markdown parsed:");
	const tokens = complexResult.value.data as unknown as Array<{ type: string }>;
	console.log("  Token count:", tokens.length);
	console.log("  Token types:", [
		...new Set(tokens.map((t) => t.type)),
	]);
}

// 3. Parse GitHub Flavored Markdown (GFM)
const gfmMD = `
# Features

| Feature | Status | Notes |
|---------|--------|-------|
| Tables  | ✅     | Supported |
| Lists   | ✅     | Supported |
| Code    | ✅     | Supported |

~~Strikethrough text~~

- [x] Task 1
- [ ] Task 2
- [ ] Task 3
`;
const gfmResult = parseMarkdown(gfmMD, "gfm.md", { gfm: true });
if (Result.isOk(gfmResult)) {
	console.log("\n✓ GFM markdown parsed:");
	const gfmTokens = gfmResult.value.data as unknown as Array<{ type: string }>;
	console.log("  Has tables:", gfmTokens.some((t) => t.type === "table"));
	console.log("  Token count:", gfmTokens.length);
}

// 4. Convert markdown to HTML
const mdForHTML = `
# Welcome

This is a **markdown** document that will be converted to HTML.

## Features

- Easy to write
- Easy to read
- Easy to convert
`;
const html = markdownToHTML(mdForHTML);
console.log("\n✓ Markdown to HTML:");
console.log(html);

// 5. Parse markdown with line breaks
const breaksMD = `
First line
Second line
Third line
`;
const breaksResult = parseMarkdown(breaksMD, "breaks.md", { breaks: true });
if (Result.isOk(breaksResult)) {
	console.log("\n✓ Markdown with line breaks:");
	console.log("  Tokens:", breaksResult.value.data.length);
}

// 6. Inspect AST tokens
const astMD = "# Title\n\nParagraph text";
const astResult = parseMarkdown(astMD, "ast.md");
if (Result.isOk(astResult)) {
	console.log("\n✓ AST Inspection:");
	const astTokens = astResult.value.data as unknown as Array<Record<string, unknown>>;
	astTokens.forEach((token, i) => {
		console.log(`  Token ${i}:`, {
			type: token["type"],
			text: (token["text"] as string) || (token["raw"] as string)?.substring(0, 30),
		});
	});
}

// 7. Access metadata
const metaResult = parseMarkdown("# Test", "meta.md");
if (Result.isOk(metaResult)) {
	console.log("\n✓ Metadata:");
	console.log("  Filename:", metaResult.value.metadata?.["filename"]);
	console.log("  Size:", metaResult.value.metadata?.["size"], "bytes");
	console.log("  Token count:", metaResult.value.metadata?.["tokenCount"]);
}

console.log("\n=== End of Examples ===");
