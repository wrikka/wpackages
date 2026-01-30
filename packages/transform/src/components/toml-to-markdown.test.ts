import { describe, expect, it } from "vitest";
import { TomlToMarkdownTransformer } from "./toml-to-markdown";

describe("TomlToMarkdownTransformer", () => {
	describe("transform", () => {
		it("should transform simple TOML to markdown list", () => {
			const toml = "name = \"test\"\nversion = \"1.0.0\"";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toContain("- **name**:");
			expect(result).toContain("- **version**:");
		});

		it("should transform TOML sections to markdown headings", () => {
			const toml = "[package]\nname = \"my-app\"\nversion = \"0.1.0\"";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toContain("### package");
			expect(result).toContain("- **name**: my-app");
		});

		it("should handle nested sections", () => {
			const toml = "[database]\n[database.connection]\nhost = \"localhost\"";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toContain("###");
		});

		it("should format values correctly", () => {
			const toml = "[config]\nport = 8080\nenabled = true";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toContain("- **port**: 8080");
			expect(result).toContain("- **enabled**: true");
		});

		it("should throw error on invalid TOML", () => {
			const toml = "[invalid\nkey = value";

			expect(() => TomlToMarkdownTransformer.transform(toml)).toThrow("Failed to parse TOML");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(TomlToMarkdownTransformer.from).toBe("toml");
		});

		it("should have correct to format", () => {
			expect(TomlToMarkdownTransformer.to).toBe("markdown");
		});
	});

	describe("edge cases", () => {
		it("should handle empty TOML", () => {
			const toml = "";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toBe("");
		});

		it("should handle TOML with arrays", () => {
			const toml = "colors = [\"red\", \"green\", \"blue\"]";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toContain("### colors");
		});

		it("should handle multiple sections", () => {
			const toml = "[section1]\nkey1 = \"value1\"\n[section2]\nkey2 = \"value2\"";
			const result = TomlToMarkdownTransformer.transform(toml);

			expect(result).toContain("### section1");
			expect(result).toContain("### section2");
		});
	});
});
