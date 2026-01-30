import { describe, expect, it } from "vitest";
import { JsonToMarkdownTransformer } from "./json-to-markdown";

describe("JsonToMarkdownTransformer", () => {
	describe("transform", () => {
		it("should transform JSON array to markdown table", () => {
			const json = "[{\"name\": \"Alice\", \"age\": 30}, {\"name\": \"Bob\", \"age\": 25}]";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("| name | age |");
			expect(result).toContain("| --- | --- |");
			expect(result).toContain("| Alice | 30 |");
			expect(result).toContain("| Bob | 25 |");
		});

		it("should transform JSON object to markdown list", () => {
			const json = "{\"name\": \"Alice\", \"age\": 30}";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("- **name**:");
			expect(result).toContain("- **age**:");
		});

		it("should handle empty array", () => {
			const json = "[]";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toBe("");
		});

		it("should handle primitive values", () => {
			const json = "\"hello\"";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("```json");
		});

		it("should handle null values in table", () => {
			const json = "[{\"name\": \"Alice\", \"email\": null}]";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("| name | email |");
		});

		it("should handle mixed data types in table", () => {
			const json = "[{\"name\": \"Alice\", \"active\": true, \"score\": 95}]";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("| name | active | score |");
			expect(result).toContain("| Alice | true | 95 |");
		});

		it("should throw error on invalid JSON", () => {
			const json = "{invalid}";

			expect(() => JsonToMarkdownTransformer.transform(json)).toThrow("Failed to parse JSON");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(JsonToMarkdownTransformer.from).toBe("json");
		});

		it("should have correct to format", () => {
			expect(JsonToMarkdownTransformer.to).toBe("markdown");
		});
	});

	describe("edge cases", () => {
		it("should handle nested objects in array", () => {
			const json = "[{\"user\": {\"name\": \"Alice\"}}]";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("|");
		});

		it("should handle array of primitives", () => {
			const json = "[1, 2, 3]";
			const result = JsonToMarkdownTransformer.transform(json);

			expect(result).toContain("|");
		});
	});
});
