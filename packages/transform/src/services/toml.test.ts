import { describe, expect, it } from "vitest";
import { TomlParser } from "./toml";

describe("TomlParser", () => {
	describe("parse", () => {
		it("should parse simple key-value pairs", () => {
			const toml = 'name = "test"\nversion = "1.0.0"';
			const result = TomlParser.parse(toml) as { name: string; version: string };

			expect(result.name).toBe("test");
			expect(result.version).toBe("1.0.0");
		});

		it("should parse sections", () => {
			const toml = '[package]\nname = "my-app"\nversion = "0.1.0"';
			const result = TomlParser.parse(toml) as { package: { name: string; version: string } };

			expect(result.package).toBeDefined();
			expect(result.package.name).toBe("my-app");
			expect(result.package.version).toBe("0.1.0");
		});

		it("should parse nested sections", () => {
			const toml = '[database]\n[database.connection]\nhost = "localhost"\nport = 5432';
			const result = TomlParser.parse(toml) as { database: { connection: { host: string; port: number } } };

			expect(result.database.connection.host).toBe("localhost");
			expect(result.database.connection.port).toBe(5432);
		});

		it("should parse arrays", () => {
			const toml = 'colors = ["red", "green", "blue"]';
			const result = TomlParser.parse(toml) as { colors: string[] };

			expect(result.colors).toEqual(["red", "green", "blue"]);
		});

		it("should parse numbers", () => {
			const toml = 'integer = 42\nfloat = 3.14';
			const result = TomlParser.parse(toml) as { integer: number; float: number };

			expect(result.integer).toBe(42);
			expect(result.float).toBe(3.14);
		});

		it("should parse booleans", () => {
			const toml = 'enabled = true\ndisabled = false';
			const result = TomlParser.parse(toml) as { enabled: boolean; disabled: boolean };

			expect(result.enabled).toBe(true);
			expect(result.disabled).toBe(false);
		});

		it("should throw error on invalid TOML", () => {
			const toml = '[invalid\nkey = value';

			expect(() => TomlParser.parse(toml)).toThrow("Failed to parse TOML");
		});
	});

	describe("stringify", () => {
		it("should stringify simple object", () => {
			const obj = { name: "test", version: "1.0.0" };
			const result = TomlParser.stringify(obj);

			expect(result).toContain('name = "test"');
			expect(result).toContain('version = "1.0.0"');
		});

		it("should stringify nested objects as sections", () => {
			const obj = { package: { name: "my-app", version: "0.1.0" } };
			const result = TomlParser.stringify(obj);

			expect(result).toContain("[package]");
			expect(result).toContain('name = "my-app"');
		});

		it("should stringify arrays", () => {
			const obj = { colors: ["red", "green", "blue"] };
			const result = TomlParser.stringify(obj);

			expect(result).toContain("colors");
			expect(result).toContain("red");
		});

		it("should stringify numbers and booleans", () => {
			const obj = { count: 42, enabled: true };
			const result = TomlParser.stringify(obj);

			expect(result).toContain("count = 42");
			expect(result).toContain("enabled = true");
		});

		it("should handle non-serializable object", () => {
			const obj = { fn: () => {} } as any;
			const result = TomlParser.stringify(obj);

			expect(result).toBeDefined();
		});
	});

	describe("format property", () => {
		it("should have correct format", () => {
			expect(TomlParser.format).toBe("toml");
		});
	});
});
