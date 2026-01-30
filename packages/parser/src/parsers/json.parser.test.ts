/**
 * JSON Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { jsonParser, parseJSON } from "./json.parser";

describe("JSON Parser", () => {
	describe("parseJSON", () => {
		it("should parse valid JSON object", () => {
			expect.assertions(3);
			const result = parseJSON("{\"name\": \"test\", \"age\": 30}", "test.json");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("json");
				expect(result.value.data).toEqual({ name: "test", age: 30 });
				expect(result.value.errors).toHaveLength(0);
			}
		});

		it("should parse valid JSON array", () => {
			expect.assertions(2);
			const result = parseJSON("[1, 2, 3, \"test\"]", "array.json");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual([1, 2, 3, "test"]);
			}
		});

		it("should parse nested JSON", () => {
			expect.assertions(2);
			const result = parseJSON(
				"{\"user\": {\"name\": \"John\", \"address\": {\"city\": \"NYC\"}}}",
				"nested.json",
			);
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual({
					user: { name: "John", address: { city: "NYC" } },
				});
			}
		});

		it("should handle empty JSON object", () => {
			expect.assertions(2);
			const result = parseJSON("{}", "empty.json");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual({});
			}
		});

		it("should handle empty JSON array", () => {
			expect.assertions(2);
			const result = parseJSON("[]", "empty-array.json");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.data).toEqual([]);
			}
		});

		it("should return error for invalid JSON", () => {
			expect.assertions(2);
			const result = parseJSON("{ invalid: json }", "invalid.json");
			expect(Result.isErr(result)).toBe(true);
			if (Result.isErr(result)) {
				expect(result.error).toContain("JSON parse error");
			}
		});

		it("should return error for trailing comma", () => {
			expect.assertions(1);
			const result = parseJSON("{\"name\": \"test\",}", "trailing.json");
			expect(Result.isErr(result)).toBe(true);
		});

		it("should include metadata", () => {
			expect.assertions(4);
			const result = parseJSON("{\"test\": true}", "meta.json");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.metadata).toBeDefined();
				expect(result.value.metadata?.filename).toBe("meta.json");
				expect(result.value.metadata?.size).toBeGreaterThan(0);
			}
		});
	});

	describe("jsonParser", () => {
		it("should have correct metadata", () => {
			expect(jsonParser.name).toBe("json");
			expect(jsonParser.supportedLanguages).toContain("json");
		});

		it("should parse through parser instance", () => {
			const result = jsonParser.parse("{\"key\": \"value\"}", "test.json");
			expect(Result.isOk(result)).toBe(true);
		});
	});
});
