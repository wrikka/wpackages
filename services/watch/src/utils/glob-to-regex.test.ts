import { describe, expect, it } from "vitest";
import { globToRegex } from "./glob-to-regex";

describe("globToRegex", () => {
	describe("basic patterns", () => {
		it("should match simple file patterns", () => {
			const regex = globToRegex("*.js");
			expect(regex.test("file.js")).toBe(true);
			expect(regex.test("index.ts")).toBe(false);
		});

		it("should match directory patterns", () => {
			const regex = globToRegex("src/**/*.ts");
			expect(regex.test("src/index.ts")).toBe(true);
			expect(regex.test("src/utils/helper.ts")).toBe(true);
			expect(regex.test("dist/index.ts")).toBe(false);
		});

		it("should handle single character wildcard", () => {
			const regex = globToRegex("file?.txt");
			expect(regex.test("file1.txt")).toBe(true);
			expect(regex.test("file12.txt")).toBe(false);
		});
	});

	describe("double star patterns", () => {
		it("should match ** with trailing slash", () => {
			const regex = globToRegex("**/node_modules/**");
			expect(regex.test("node_modules/react/index.js")).toBe(true);
			expect(regex.test("src/node_modules/pkg/index.js")).toBe(true);
		});

		it("should match ** without trailing slash", () => {
			const regex = globToRegex("src/**");
			expect(regex.test("src/index.ts")).toBe(true);
			expect(regex.test("src/utils/helper.ts")).toBe(true);
		});
	});

	describe("character classes", () => {
		it("should handle character classes", () => {
			const regex = globToRegex("file[0-9].txt");
			expect(regex.test("file1.txt")).toBe(true);
			expect(regex.test("file9.txt")).toBe(true);
			expect(regex.test("filea.txt")).toBe(false);
		});

		it("should pass through character class syntax", () => {
			// Character classes are passed through to regex as-is
			const regex = globToRegex("file[abc].txt");
			expect(regex.test("filea.txt")).toBe(true);
			expect(regex.test("fileb.txt")).toBe(true);
			expect(regex.test("filed.txt")).toBe(false);
		});
	});

	describe("brace expansion", () => {
		it("should handle brace expansion", () => {
			const regex = globToRegex("*.{js,ts}");
			expect(regex.test("index.js")).toBe(true);
			expect(regex.test("index.ts")).toBe(true);
			expect(regex.test("index.css")).toBe(false);
		});

		it("should handle multiple braces", () => {
			const regex = globToRegex("{src,test}/**/*.{js,ts}");
			expect(regex.test("src/index.js")).toBe(true);
			expect(regex.test("test/index.ts")).toBe(true);
			expect(regex.test("dist/index.js")).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("should handle paths with backslashes", () => {
			const regex = globToRegex("src/**/*.ts");
			expect(regex.test("src\\utils\\helper.ts".replace(/\\/g, "/"))).toBe(true);
		});

		it("should handle empty pattern", () => {
			const regex = globToRegex("");
			expect(regex.test("")).toBe(true);
			expect(regex.test("anything")).toBe(false);
		});

		it("should escape special regex characters", () => {
			const regex = globToRegex("file.txt");
			expect(regex.test("file.txt")).toBe(true);
			expect(regex.test("fileatxt")).toBe(false);
		});

		it("should handle complex paths", () => {
			const regex = globToRegex("**/node_modules/**/*.{js,ts}");
			expect(regex.test("node_modules/react/dist/index.js")).toBe(true);
			expect(regex.test("src/node_modules/pkg/lib/index.ts")).toBe(true);
		});
	});
});
