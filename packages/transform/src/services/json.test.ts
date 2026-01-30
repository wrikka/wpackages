import { describe, expect, it } from "vitest";
import { JsonParser } from "./json";

describe("JsonParser", () => {
	describe("parse", () => {
		it("should parse valid JSON object", () => {
			const json = "{\"name\": \"test\", \"value\": 123}";
			const result = JsonParser.parse(json);

			expect(result).toEqual({ name: "test", value: 123 });
		});

		it("should parse valid JSON array", () => {
			const json = "[1, 2, 3]";
			const result = JsonParser.parse(json);

			expect(result).toEqual([1, 2, 3]);
		});

		it("should parse nested JSON", () => {
			const json = "{\"user\": {\"name\": \"Alice\", \"age\": 30}}";
			const result = JsonParser.parse(json);

			expect(result).toEqual({ user: { name: "Alice", age: 30 } });
		});

		it("should throw error on invalid JSON", () => {
			const json = "{invalid json}";

			expect(() => JsonParser.parse(json)).toThrow("Failed to parse JSON");
		});

		it("should parse JSON with null values", () => {
			const json = "{\"value\": null}";
			const result = JsonParser.parse(json);

			expect(result).toEqual({ value: null });
		});

		it("should parse JSON with boolean values", () => {
			const json = "{\"active\": true, \"deleted\": false}";
			const result = JsonParser.parse(json);

			expect(result).toEqual({ active: true, deleted: false });
		});
	});

	describe("stringify", () => {
		it("should stringify object with pretty print", () => {
			const obj = { name: "test", value: 123 };
			const result = JsonParser.stringify(obj, { pretty: true, indent: 2 });

			expect(result).toContain("\"name\"");
			expect(result).toContain("\"test\"");
			expect(result).toContain("\n");
		});

		it("should stringify object without pretty print", () => {
			const obj = { name: "test", value: 123 };
			const result = JsonParser.stringify(obj, { pretty: false });

			expect(result).not.toContain("\n");
			expect(result).toEqual("{\"name\":\"test\",\"value\":123}");
		});

		it("should stringify with custom indent", () => {
			const obj = { name: "test" };
			const result = JsonParser.stringify(obj, { pretty: true, indent: 4 });

			expect(result).toContain("    ");
		});

		it("should stringify array", () => {
			const arr = [1, 2, 3];
			const result = JsonParser.stringify(arr, { pretty: true });

			expect(result).toContain("1");
			expect(result).toContain("2");
			expect(result).toContain("3");
		});

		it("should stringify nested objects", () => {
			const obj = { user: { name: "Alice" } };
			const result = JsonParser.stringify(obj, { pretty: true });

			expect(result).toContain("user");
			expect(result).toContain("Alice");
		});

		it("should handle non-serializable object", () => {
			const obj = { fn: () => {} };
			const result = JsonParser.stringify(obj);

			expect(result).toBeDefined();
		});
	});

	describe("format property", () => {
		it("should have correct format", () => {
			expect(JsonParser.format).toBe("json");
		});
	});
});
