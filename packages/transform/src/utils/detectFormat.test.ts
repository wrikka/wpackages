import { describe, expect, it } from "vitest";
import { detectFormat } from "./detectFormat";

describe("detectFormat", () => {
	describe("detect from filename", () => {
		it("should detect markdown from .md extension", () => {
			const result = detectFormat("any content", "file.md");
			expect(result).toBe("markdown");
		});

		it("should detect markdown from .markdown extension", () => {
			const result = detectFormat("any content", "file.markdown");
			expect(result).toBe("markdown");
		});

		it("should detect typescript from .ts extension", () => {
			const result = detectFormat("any content", "file.ts");
			expect(result).toBe("typescript");
		});

		it("should detect typescript from .tsx extension", () => {
			const result = detectFormat("any content", "file.tsx");
			expect(result).toBe("typescript");
		});

		it("should detect typescript from .js extension", () => {
			const result = detectFormat("any content", "file.js");
			expect(result).toBe("typescript");
		});

		it("should detect typescript from .jsx extension", () => {
			const result = detectFormat("any content", "file.jsx");
			expect(result).toBe("typescript");
		});

		it("should detect toml from .toml extension", () => {
			const result = detectFormat("any content", "file.toml");
			expect(result).toBe("toml");
		});

		it("should detect json from .json extension", () => {
			const result = detectFormat("any content", "file.json");
			expect(result).toBe("json");
		});
	});

	describe("detect from content - JSON", () => {
		it("should detect JSON object", () => {
			const result = detectFormat("{\"key\": \"value\"}");
			expect(result).toBe("json");
		});

		it("should detect JSON array", () => {
			const result = detectFormat("[1, 2, 3]");
			expect(result).toBe("json");
		});

		it("should detect JSON with nested objects", () => {
			const result = detectFormat("{\"user\": {\"name\": \"Alice\"}}");
			expect(result).toBe("json");
		});

		it("should handle invalid JSON gracefully", () => {
			const result = detectFormat("{invalid}");
			expect(result).not.toBe("json");
		});
	});

	describe("detect from content - TOML", () => {
		it("should detect TOML with sections", () => {
			const result = detectFormat("[package]\nname = \"test\"");
			expect(result).toBe("toml");
		});

		it("should detect TOML with key-value pairs", () => {
			const result = detectFormat("name = \"test\"\nversion = \"1.0.0\"");
			expect(result).toBe("toml");
		});

		it("should detect TOML with nested sections", () => {
			const result = detectFormat("[database.connection]\nhost = \"localhost\"");
			expect(result).toBe("toml");
		});
	});

	describe("detect from content - TypeScript", () => {
		it("should detect TypeScript const declaration", () => {
			const result = detectFormat("const x = 1;");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript let declaration", () => {
			const result = detectFormat("let x = 1;");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript var declaration", () => {
			const result = detectFormat("var x = 1;");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript function", () => {
			const result = detectFormat("function add(a, b) { return a + b; }");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript class", () => {
			const result = detectFormat("class MyClass { }");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript interface", () => {
			const result = detectFormat("interface User { name: string; }");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript type", () => {
			const result = detectFormat("type User = { name: string; }");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript import", () => {
			const result = detectFormat("import { x } from \"module\";");
			expect(result).toBe("typescript");
		});

		it("should detect TypeScript export", () => {
			const result = detectFormat("export const x = 1;");
			expect(result).toBe("typescript");
		});
	});

	describe("default to markdown", () => {
		it("should default to markdown for plain text", () => {
			const result = detectFormat("This is plain text");
			expect(result).toBe("markdown");
		});

		it("should default to markdown for markdown content", () => {
			const result = detectFormat("# Heading\n\nParagraph");
			expect(result).toBe("markdown");
		});

		it("should default to markdown for unknown content", () => {
			const result = detectFormat("unknown content");
			expect(result).toBe("markdown");
		});
	});

	describe("priority and edge cases", () => {
		it("should prioritize filename over content", () => {
			const result = detectFormat("{\"key\": \"value\"}", "file.ts");
			expect(result).toBe("typescript");
		});

		it("should handle whitespace", () => {
			const result = detectFormat("  {\"key\": \"value\"}  ");
			expect(result).toBe("json");
		});

		it("should handle empty string", () => {
			const result = detectFormat("");
			expect(result).toBe("markdown");
		});

		it("should handle multiline content", () => {
			const result = detectFormat("const x = 1;\nconst y = 2;");
			expect(result).toBe("typescript");
		});
	});
});
