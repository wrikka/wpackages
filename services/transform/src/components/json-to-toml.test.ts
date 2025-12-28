import { describe, expect, it } from "vitest";
import { JsonToTomlTransformer } from "./json-to-toml";

describe("JsonToTomlTransformer", () => {
	describe("transform", () => {
		it("should transform simple JSON object to TOML", () => {
			const json = '{"name": "test", "version": "1.0.0"}';
			const result = JsonToTomlTransformer.transform(json);

			expect(result).toContain('name = "test"');
			expect(result).toContain('version = "1.0.0"');
		});

		it("should transform nested JSON to TOML sections", () => {
			const json = '{"package": {"name": "my-app", "version": "0.1.0"}}';
			const result = JsonToTomlTransformer.transform(json);

			expect(result).toContain("[package]");
			expect(result).toContain('name = "my-app"');
		});

		it("should transform JSON with numbers", () => {
			const json = '{"count": 42, "ratio": 3.14}';
			const result = JsonToTomlTransformer.transform(json);

			expect(result).toContain("count = 42");
			expect(result).toContain("ratio = 3.14");
		});

		it("should transform JSON with booleans", () => {
			const json = '{"enabled": true, "disabled": false}';
			const result = JsonToTomlTransformer.transform(json);

			expect(result).toContain("enabled = true");
			expect(result).toContain("disabled = false");
		});

		it("should transform JSON with arrays", () => {
			const json = '{"colors": ["red", "green", "blue"]}';
			const result = JsonToTomlTransformer.transform(json);

			expect(result).toContain("colors");
			expect(result).toContain("red");
		});

		it("should throw error on invalid JSON", () => {
			const json = "{invalid}";

			expect(() => JsonToTomlTransformer.transform(json)).toThrow("Failed to parse JSON");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(JsonToTomlTransformer.from).toBe("json");
		});

		it("should have correct to format", () => {
			expect(JsonToTomlTransformer.to).toBe("toml");
		});
	});

	describe("options", () => {
		it("should accept transform options", () => {
			const json = '{"name": "test"}';
			const result = JsonToTomlTransformer.transform(json, { pretty: true });

			expect(result).toBeTruthy();
		});
	});
});
