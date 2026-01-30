/**
 * Language detector tests
 */

import { describe, expect, it } from "vitest";
import {
	detectLanguage,
	getLanguageInfo,
	getLanguagesByCategory,
	getSupportedLanguages,
	supportsAST,
} from "./language-detector.util";

describe("Language Detector", () => {
	describe("detectLanguage", () => {
		it("should detect TypeScript", () => {
			expect(detectLanguage("index.ts")).toBe("typescript");
			expect(detectLanguage("Component.tsx")).toBe("tsx");
		});

		it("should detect JavaScript", () => {
			expect(detectLanguage("script.js")).toBe("javascript");
			expect(detectLanguage("Component.jsx")).toBe("jsx");
		});

		it("should detect data formats", () => {
			expect(detectLanguage("config.json")).toBe("json");
			expect(detectLanguage("data.yaml")).toBe("yaml");
			expect(detectLanguage("config.toml")).toBe("toml");
		});

		it("should detect markup languages", () => {
			expect(detectLanguage("README.md")).toBe("markdown");
			expect(detectLanguage("index.html")).toBe("html");
			expect(detectLanguage("data.xml")).toBe("xml");
		});

		it("should detect style languages", () => {
			expect(detectLanguage("style.css")).toBe("css");
			expect(detectLanguage("style.scss")).toBe("scss");
			expect(detectLanguage("style.less")).toBe("less");
		});

		it("should return unknown for unrecognized extensions", () => {
			expect(detectLanguage("file.unknown")).toBe("unknown");
			expect(detectLanguage("noextension")).toBe("unknown");
		});

		it("should be case-insensitive", () => {
			expect(detectLanguage("FILE.TS")).toBe("typescript");
			expect(detectLanguage("CONFIG.JSON")).toBe("json");
		});
	});

	describe("getLanguageInfo", () => {
		it("should get info for TypeScript", () => {
			const info = getLanguageInfo("typescript");
			expect(info).toBeDefined();
			expect(info?.language).toBe("typescript");
			expect(info?.category).toBe("code");
			expect(info?.supportsAST).toBe(true);
			expect(info?.extensions).toContain(".ts");
		});

		it("should get info for JSON", () => {
			const info = getLanguageInfo("json");
			expect(info).toBeDefined();
			expect(info?.category).toBe("data");
			expect(info?.supportsAST).toBe(false);
		});

		it("should return undefined for unknown language", () => {
			const info = getLanguageInfo("unknown");
			expect(info).toBeUndefined();
		});
	});

	describe("supportsAST", () => {
		it("should return true for languages with AST", () => {
			expect(supportsAST("typescript")).toBe(true);
			expect(supportsAST("javascript")).toBe(true);
			expect(supportsAST("markdown")).toBe(true);
			expect(supportsAST("html")).toBe(true);
			expect(supportsAST("css")).toBe(true);
		});

		it("should return false for languages without AST", () => {
			expect(supportsAST("json")).toBe(false);
			expect(supportsAST("yaml")).toBe(false);
			expect(supportsAST("toml")).toBe(false);
		});

		it("should return false for unknown language", () => {
			expect(supportsAST("unknown")).toBe(false);
		});
	});

	describe("getSupportedLanguages", () => {
		it("should return array of all supported languages", () => {
			const languages = getSupportedLanguages();
			expect(Array.isArray(languages)).toBe(true);
			expect(languages.length).toBeGreaterThan(0);
			expect(languages).toContain("typescript");
			expect(languages).toContain("json");
			expect(languages).toContain("yaml");
		});
	});

	describe("getLanguagesByCategory", () => {
		it("should get code languages", () => {
			const languages = getLanguagesByCategory("code");
			expect(languages).toContain("typescript");
			expect(languages).toContain("javascript");
		});

		it("should get data languages", () => {
			const languages = getLanguagesByCategory("data");
			expect(languages).toContain("json");
			expect(languages).toContain("yaml");
		});

		it("should get markup languages", () => {
			const languages = getLanguagesByCategory("markup");
			expect(languages).toContain("html");
			expect(languages).toContain("xml");
			expect(languages).toContain("markdown");
		});

		it("should get style languages", () => {
			const languages = getLanguagesByCategory("style");
			expect(languages).toContain("css");
			expect(languages).toContain("scss");
		});
	});
});
