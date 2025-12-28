import { describe, expect, it } from "vitest";
import { TomlToJsonTransformer } from "./toml-to-json";

describe("TomlToJsonTransformer", () => {
	describe("transform", () => {
		it("should transform simple TOML to JSON", () => {
			const toml = 'name = "test"\nversion = "1.0.0"';
			const result = TomlToJsonTransformer.transform(toml);
			const parsed = JSON.parse(result);

			expect(parsed.name).toBe("test");
			expect(parsed.version).toBe("1.0.0");
		});

		it("should transform TOML sections to JSON objects", () => {
			const toml = '[package]\nname = "my-app"\nversion = "0.1.0"';
			const result = TomlToJsonTransformer.transform(toml);
			const parsed = JSON.parse(result);

			expect(parsed.package).toBeDefined();
			expect(parsed.package.name).toBe("my-app");
		});

		it("should transform TOML arrays to JSON arrays", () => {
			const toml = 'colors = ["red", "green", "blue"]';
			const result = TomlToJsonTransformer.transform(toml);
			const parsed = JSON.parse(result);

			expect(parsed.colors).toEqual(["red", "green", "blue"]);
		});

		it("should transform TOML numbers", () => {
			const toml = 'count = 42\nratio = 3.14';
			const result = TomlToJsonTransformer.transform(toml);
			const parsed = JSON.parse(result);

			expect(parsed.count).toBe(42);
			expect(parsed.ratio).toBe(3.14);
		});

		it("should transform TOML booleans", () => {
			const toml = 'enabled = true\ndisabled = false';
			const result = TomlToJsonTransformer.transform(toml);
			const parsed = JSON.parse(result);

			expect(parsed.enabled).toBe(true);
			expect(parsed.disabled).toBe(false);
		});

		it("should throw error on invalid TOML", () => {
			const toml = "[invalid\nkey = value";

			expect(() => TomlToJsonTransformer.transform(toml)).toThrow("Failed to parse TOML");
		});
	});

	describe("properties", () => {
		it("should have correct from format", () => {
			expect(TomlToJsonTransformer.from).toBe("toml");
		});

		it("should have correct to format", () => {
			expect(TomlToJsonTransformer.to).toBe("json");
		});
	});

	describe("options", () => {
		it("should support pretty print option", () => {
			const toml = 'name = "test"';
			const result = TomlToJsonTransformer.transform(toml, { pretty: true, indent: 2 });

			expect(result).toContain("\n");
		});

		it("should support compact output", () => {
			const toml = 'name = "test"';
			const result = TomlToJsonTransformer.transform(toml, { pretty: false });

			expect(result).not.toContain("\n");
		});
	});
});
