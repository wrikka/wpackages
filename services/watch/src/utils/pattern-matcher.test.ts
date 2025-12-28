import { describe, expect, it } from "vitest";
import { createPatternMatcher, matchAnyPattern, matchPattern } from "./pattern-matcher";

describe("pattern-matcher", () => {
	describe("matchPattern", () => {
		it("should match a simple pattern", () => {
			expect(matchPattern("foo.js", "*.js")).toBe(true);
			expect(matchPattern("foo.ts", "*.js")).toBe(false);
		});

		it("should match a directory pattern", () => {
			expect(matchPattern("src/components/Button.js", "src/**/*.js")).toBe(
				true,
			);
			expect(matchPattern("src/utils.js", "src/**/*.js")).toBe(true);
		});

		it("should handle question mark wildcards", () => {
			expect(matchPattern("file1.txt", "file?.txt")).toBe(true);
			expect(matchPattern("file12.txt", "file?.txt")).toBe(false);
		});
	});

	describe("matchAnyPattern", () => {
		it("should return true if any pattern matches", () => {
			const patterns = ["*.js", "*.css"];
			expect(matchAnyPattern("script.js", patterns)).toBe(true);
			expect(matchAnyPattern("style.css", patterns)).toBe(true);
		});

		it("should return false if no patterns match", () => {
			const patterns = ["*.js", "*.css"];
			expect(matchAnyPattern("image.png", patterns)).toBe(false);
		});
	});

	describe("createPatternMatcher", () => {
		it("should create a function that matches against given patterns", () => {
			const patterns = ["node_modules/**", "dist/**"];
			const matcher = createPatternMatcher(patterns);

			expect(matcher("node_modules/express/index.js")).toBe(true);
			expect(matcher("dist/bundle.js")).toBe(true);
			expect(matcher("src/index.js")).toBe(false);
		});
	});
});
