import { describe, expect, it } from "vitest";
import { AdvancedPatternMatcher } from "./advanced-matcher";

describe("AdvancedPatternMatcher", () => {
	describe("shouldIgnore", () => {
		it("should ignore paths matching regular patterns", () => {
			const matcher = new AdvancedPatternMatcher(["node_modules/**", "dist/**"]);
			expect(matcher.shouldIgnore("node_modules/react/index.js")).toBe(true);
			expect(matcher.shouldIgnore("dist/bundle.js")).toBe(true);
			expect(matcher.shouldIgnore("src/index.js")).toBe(false);
		});

		it("should not ignore paths matching negated patterns", () => {
			const matcher = new AdvancedPatternMatcher(["**/*.log", "!important.log"]);
			expect(matcher.shouldIgnore("debug.log")).toBe(true);
			expect(matcher.shouldIgnore("important.log")).toBe(false);
		});

		it("should handle complex negation patterns", () => {
			const matcher = new AdvancedPatternMatcher([
				"**/*.spec.ts",
				"!**/__tests__/**/*.spec.ts",
			]);
			expect(matcher.shouldIgnore("src/app.spec.ts")).toBe(true);
			expect(matcher.shouldIgnore("src/__tests__/app.spec.ts")).toBe(false);
		});

		it("should normalize paths with backslashes", () => {
			const matcher = new AdvancedPatternMatcher(["src/**"]);
			expect(matcher.shouldIgnore("src\\components\\Button.ts")).toBe(true);
		});
	});

	describe("matches", () => {
		it("should match paths against regular patterns", () => {
			const matcher = new AdvancedPatternMatcher(["src/**", "test/**"]);
			expect(matcher.matches("src/index.ts")).toBe(true);
			expect(matcher.matches("test/index.test.ts")).toBe(true);
			expect(matcher.matches("dist/index.js")).toBe(false);
		});
	});

	describe("getPatterns", () => {
		it("should return all patterns", () => {
			const patterns = ["node_modules/**", "!important/**"];
			const matcher = new AdvancedPatternMatcher(patterns);
			expect(matcher.getPatterns()).toEqual(patterns);
		});
	});
});
