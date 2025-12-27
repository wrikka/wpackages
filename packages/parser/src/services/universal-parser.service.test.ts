/**
 * Universal Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { beforeAll, describe, expect, it } from "vitest";
import { Result } from "../utils";
import {
	getParser,
	getSupportedLanguages,
	initializeAsyncParsers,
	isLanguageSupported,
	parse,
} from "./universal-parser.service";

describe("Universal Parser", () => {
	beforeAll(async () => {
		await initializeAsyncParsers();
	});

	describe("parse", () => {
		it("should parse JSON", async () => {
			expect.assertions(3);
			const result = await parse("{\"name\": \"test\"}", "config.json");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("json");
				expect(result.value.data).toEqual({ name: "test" });
			}
		});

		it("should parse YAML", async () => {
			expect.assertions(3);
			const result = await parse("name: test\nage: 30", "config.yaml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("yaml");
				expect(result.value.data).toEqual({ name: "test", age: 30 });
			}
		});

		it("should parse TOML", async () => {
			expect.assertions(2);
			const result = await parse("[package]\nname = \"test\"", "config.toml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("toml");
			}
		});

		it("should parse Markdown", async () => {
			expect.assertions(3);
			const result = await parse("# Hello\n\nWorld", "README.md");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("markdown");
				expect(typeof result.value.data).toBe("string");
			}
		});

		it("should parse HTML", async () => {
			expect.assertions(2);
			const result = await parse("<div>Hello</div>", "index.html");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("html");
			}
		});

		it("should parse XML", async () => {
			expect.assertions(2);
			const result = await parse("<root><item>test</item></root>", "data.xml");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("xml");
			}
		});

		it("should parse CSS", async () => {
			expect.assertions(2);
			const result = await parse(".class { color: red; }", "style.css");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				expect(result.value.language).toBe("css");
			}
		});

		it("should parse TypeScript", async () => {
			expect.assertions(2);
			const result = await parse("const x: number = 42;", "index.ts");
			expect(Result.isOk(result)).toBe(true);
			if (Result.isOk(result)) {
				// The javascriptParser handles ts, tsx, etc., but the language in the result is 'javascript'.
				// This is expected behavior for this specific parser.
				expect(result.value.language).toBe("javascript");
			}
		});

		it("should return error for unknown language", async () => {
			const result = await parse("content", "file.unknown");
			expect(Result.isErr(result)).toBe(true);
		});

		it("should handle invalid JSON", async () => {
			const result = await parse("{ invalid }", "bad.json");
			expect(Result.isErr(result)).toBe(true);
		});
	});

	describe("getParser", () => {
		it("should get parser for language", () => {
			const parser = getParser("json");
			expect(parser).toBeDefined();
			expect(parser?.name).toBe("json");
		});

		it("should return undefined for unsupported language", () => {
			const parser = getParser("python");
			expect(parser).toBeUndefined();
		});
	});

	describe("getSupportedLanguages", () => {
		it("should return array of supported languages", () => {
			const languages = getSupportedLanguages();
			expect(Array.isArray(languages)).toBe(true);
			expect(languages.length).toBeGreaterThan(0);
			expect(languages).toContain("json");
			expect(languages).toContain("typescript");
		});
	});

	describe("isLanguageSupported", () => {
		it("should return true for supported language", () => {
			expect(isLanguageSupported("json")).toBe(true);
			expect(isLanguageSupported("yaml")).toBe(true);
			expect(isLanguageSupported("typescript")).toBe(true);
		});

		it("should return false for unsupported language", () => {
			expect(isLanguageSupported("python")).toBe(false);
			expect(isLanguageSupported("unknown")).toBe(false);
		});
	});
});
