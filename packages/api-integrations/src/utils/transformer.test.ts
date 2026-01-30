import { describe, expect, it } from "vitest";
import {
	flatten,
	normalizeString,
	omit,
	pick,
	removeEmptyStrings,
	removeNullValues,
	removeUndefinedValues,
	toCamelCase,
	toCamelCaseKeys,
	toSnakeCase,
	toSnakeCaseKeys,
	trimStringValues,
} from "./transformer";

describe("Transformer Utilities", () => {
	describe("removeNullValues", () => {
		it("should remove null values", () => {
			const obj = { a: 1, b: null, c: "test" };
			const result = removeNullValues(obj);

			expect(result).toEqual({ a: 1, c: "test" });
		});
	});

	describe("removeUndefinedValues", () => {
		it("should remove undefined values", () => {
			const obj = { a: 1, b: undefined, c: "test" };
			const result = removeUndefinedValues(obj);

			expect(result).toEqual({ a: 1, c: "test" });
		});
	});

	describe("removeEmptyStrings", () => {
		it("should remove empty strings", () => {
			const obj = { a: 1, b: "", c: "test" };
			const result = removeEmptyStrings(obj);

			expect(result).toEqual({ a: 1, c: "test" });
		});
	});

	describe("toCamelCase", () => {
		it("should convert to camelCase", () => {
			expect(toCamelCase("user_name")).toBe("userName");
			expect(toCamelCase("first_name")).toBe("firstName");
			expect(toCamelCase("api_key")).toBe("apiKey");
		});
	});

	describe("toSnakeCase", () => {
		it("should convert to snake_case", () => {
			expect(toSnakeCase("userName")).toBe("user_name");
			expect(toSnakeCase("firstName")).toBe("first_name");
			expect(toSnakeCase("apiKey")).toBe("api_key");
		});
	});

	describe("toCamelCaseKeys", () => {
		it("should convert object keys to camelCase", () => {
			const obj = { first_name: "John", user_name: "John" };
			const result = toCamelCaseKeys(obj);

			expect(result).toEqual({ firstName: "John", userName: "John" });
		});
	});

	describe("toSnakeCaseKeys", () => {
		it("should convert object keys to snake_case", () => {
			const obj = { firstName: "John", userName: "John" };
			const result = toSnakeCaseKeys(obj);

			expect(result).toEqual({ first_name: "John", user_name: "John" });
		});
	});

	describe("trimStringValues", () => {
		it("should trim string values", () => {
			const obj = { age: 30, city: " NYC ", name: "  John  " };
			const result = trimStringValues(obj);

			expect(result).toEqual({ age: 30, city: "NYC", name: "John" });
		});
	});

	describe("normalizeString", () => {
		it("should trim string", () => {
			const result = normalizeString("  test  ", { trim: true });
			expect(result).toBe("test");
		});

		it("should convert to lowercase", () => {
			const result = normalizeString("TEST", { lowercase: true });
			expect(result).toBe("test");
		});

		it("should convert to uppercase", () => {
			const result = normalizeString("test", { uppercase: true });
			expect(result).toBe("TEST");
		});

		it("should remove whitespace", () => {
			const result = normalizeString("hello world", { removeWhitespace: true });
			expect(result).toBe("helloworld");
		});

		it("should remove special chars", () => {
			const result = normalizeString("hello@world!", {
				removeSpecialChars: true,
			});
			expect(result).toBe("helloworld");
		});
	});

	describe("pick", () => {
		it("should pick specified fields", () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = pick(obj, ["a", "c"]);

			expect(result).toEqual({ a: 1, c: 3 });
		});
	});

	describe("omit", () => {
		it("should omit specified fields", () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = omit(obj, ["b"]);

			expect(result).toEqual({ a: 1, c: 3 });
		});
	});

	describe("flatten", () => {
		it("should flatten nested object", () => {
			const obj = {
				user: {
					address: {
						city: "NYC",
					},
					name: "John",
				},
			};
			const result = flatten(obj);

			expect(result).toEqual({
				"user.address.city": "NYC",
				"user.name": "John",
			});
		});
	});
});
