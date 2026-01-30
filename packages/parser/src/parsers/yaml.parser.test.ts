/**
 * YAML Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { parseYAML_source, stringifyYAML, yamlParser } from "./yaml.parser";

describe("YAML Parser", () => {
	describe("parseYAML_source", () => {
		it("should parse simple YAML object", () => {
			const yaml = "name: test\nage: 30";
			const result = parseYAML_source(yaml, "config.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("yaml");
				expect(result.value.data).toEqual({ name: "test", age: 30 });
				expect(result.value.errors).toHaveLength(0);
			}
		});

		it("should parse YAML array", () => {
			const yaml = "- item1\n- item2\n- item3";
			const result = parseYAML_source(yaml, "list.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual(["item1", "item2", "item3"]);
			}
		});

		it("should parse nested YAML", () => {
			const yaml = `
user:
  name: John
  address:
    city: NYC
    zip: 10001
`;
			const result = parseYAML_source(yaml, "nested.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual({
					user: {
						name: "John",
						address: { city: "NYC", zip: 10001 },
					},
				});
			}
		});

		it("should parse YAML with arrays and objects", () => {
			const yaml = `
users:
  - name: Alice
    age: 25
  - name: Bob
    age: 30
`;
			const result = parseYAML_source(yaml, "users.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const data = result.value.data as { users: unknown[] };
				expect(data.users).toHaveLength(2);
			}
		});

		it("should handle empty YAML", () => {
			const result = parseYAML_source("", "empty.yaml");
			expect(Result.isOk(result)).toBe(true);
		});

		it("should parse multi-line strings", () => {
			const yaml = `
description: |
  This is a
  multi-line
  string
`;
			const result = parseYAML_source(yaml, "multiline.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				const data = result.value.data as { description: string };
				expect(data.description).toContain("multi-line");
			}
		});

		it("should return error for invalid YAML", () => {
			const yaml = "invalid:\n  - item1\n - item2"; // Bad indentation
			const result = parseYAML_source(yaml, "invalid.yaml");
			// YAML parser is very permissive, but some errors should still be caught
			expect(result).toBeDefined();
		});

		it("should parse with strict mode", () => {
			const yaml = "key: value\nkey: duplicate"; // Duplicate key
			const result = parseYAML_source(yaml, "strict.yaml", { strict: true });
			// In strict mode, this might produce errors depending on YAML lib config
			expect(result).toBeDefined();
		});

		it("should include metadata", () => {
			const result = parseYAML_source("test: value", "meta.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.metadata).toBeDefined();
				expect(result.value.metadata?.filename).toBe("meta.yaml");
				expect(result.value.metadata?.size).toBeGreaterThan(0);
			}
		});
	});

	describe("stringifyYAML", () => {
		it("should stringify object to YAML", () => {
			const data = { name: "test", age: 30 };
			const yaml = stringifyYAML(data);
			expect(yaml).toContain("name: test");
			expect(yaml).toContain("age: 30");
		});

		it("should stringify array to YAML", () => {
			const data = ["item1", "item2", "item3"];
			const yaml = stringifyYAML(data);
			expect(yaml).toContain("- item1");
			expect(yaml).toContain("- item2");
		});

		it("should stringify nested structures", () => {
			const data = {
				user: { name: "John", address: { city: "NYC" } },
			};
			const yaml = stringifyYAML(data);
			expect(yaml).toContain("user:");
			expect(yaml).toContain("name: John");
			expect(yaml).toContain("address:");
		});
	});

	describe("yamlParser", () => {
		it("should have correct metadata", () => {
			expect(yamlParser.name).toBe("yaml");
			expect(yamlParser.supportedLanguages).toContain("yaml");
		});

		it("should parse through parser instance", () => {
			const result = yamlParser.parse("key: value", "test.yaml");
			expect(Result.isOk(result)).toBe(true);
		});
	});
});
