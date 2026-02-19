/**
 * TOML Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { parseTOMLSource, tomlParser } from "./toml.parser";

describe("TOML Parser", () => {
	describe("parseTOMLSource", () => {
		it("should parse simple TOML", () => {
			const toml = "title = \"Test\"\nversion = \"1.0.0\"";
			const result = parseTOMLSource(toml, "config.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("toml");
				expect(result.value.data.title).toBe("Test");
				expect(result.value.data.version).toBe("1.0.0");
				expect(result.value.errors).toHaveLength(0);
			}
		});

		it("should parse TOML with sections", () => {
			const toml = `
[package]
name = "my-app"
version = "0.1.0"

[dependencies]
foo = "1.0"
bar = "2.0"
`;
			const result = parseTOMLSource(toml, "Cargo.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data.package).toBeDefined();
				expect(result.value.data.dependencies).toBeDefined();
			}
		});

		it("should parse TOML arrays", () => {
			const toml = `
colors = ["red", "green", "blue"]
numbers = [1, 2, 3]
`;
			const result = parseTOMLSource(toml, "arrays.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(Array.isArray(result.value.data.colors)).toBe(true);
				expect(result.value.data.colors).toHaveLength(3);
			}
		});

		it("should parse nested TOML tables", () => {
			const toml = `
[server]
host = "localhost"
port = 8080

[server.ssl]
enabled = true
cert = "cert.pem"
`;
			const result = parseTOMLSource(toml, "nested.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const data = result.value.data as {
					server: { host: string; port: number; ssl: { enabled: boolean } };
				};
				expect(data.server.ssl.enabled).toBe(true);
			}
		});

		it("should parse TOML with different types", () => {
			const toml = `
string = "text"
integer = 42
float = 3.14
boolean = true
date = 2024-01-01T00:00:00Z
`;
			const result = parseTOMLSource(toml, "types.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data.string).toBe("text");
				expect(result.value.data.integer).toBe(42);
				expect(result.value.data.float).toBeCloseTo(3.14);
				expect(result.value.data.boolean).toBe(true);
			}
		});

		it("should handle empty TOML", () => {
			const result = parseTOMLSource("", "empty.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual({});
			}
		});

		it("should return error for invalid TOML", () => {
			const toml = "[invalid\nkey = value"; // Missing closing bracket
			const result = parseTOMLSource(toml, "invalid.toml");
			expect(Result.isErr(result)).toBe(true);
			if (Result.isErr(result)) {
				expect(result.error).toContain("TOML parse error");
			}
		});

		it("should include metadata", () => {
			const result = parseTOMLSource("key = 'value'", "meta.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.metadata).toBeDefined();
				expect(result.value.metadata?.filename).toBe("meta.toml");
				expect(result.value.metadata?.size).toBeGreaterThan(0);
			}
		});
	});

	describe("tomlParser", () => {
		it("should have correct metadata", () => {
			expect(tomlParser.name).toBe("toml");
			expect(tomlParser.supportedLanguages).toContain("toml");
		});

		it("should parse through parser instance", () => {
			const result = tomlParser.parse("key = 'value'", "test.toml");
			expect(Result.isOk(result)).toBe(true);
		});
	});
});
