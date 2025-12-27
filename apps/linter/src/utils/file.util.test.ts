import { describe, expect, it } from "vitest";
import * as File from "./file.util";

describe("File utilities", () => {
	it("should check if file is lintable", () => {
		expect(File.isLintableFile("test.ts")).toBe(true);
		expect(File.isLintableFile("test.tsx")).toBe(true);
		expect(File.isLintableFile("test.js")).toBe(true);
		expect(File.isLintableFile("test.jsx")).toBe(true);
		expect(File.isLintableFile("test.txt")).toBe(false);
		expect(File.isLintableFile("test.json")).toBe(false);
	});

	it("should check if directory should be ignored", () => {
		expect(File.shouldIgnoreDirectory("node_modules")).toBe(true);
		expect(File.shouldIgnoreDirectory("dist")).toBe(true);
		expect(File.shouldIgnoreDirectory("src")).toBe(false);
	});

	it("should normalize paths", () => {
		expect(File.normalizePath("src\\test\\file.ts")).toBe("src/test/file.ts");
		expect(File.normalizePath("src/test/file.ts")).toBe("src/test/file.ts");
	});

	it("should get file extension", () => {
		expect(File.getExtension("test.ts")).toBe(".ts");
		expect(File.getExtension("test.min.js")).toBe(".js");
		expect(File.getExtension("README")).toBe("");
	});

	it("should get basename", () => {
		expect(File.getBasename("src/test/file.ts")).toBe("file.ts");
		expect(File.getBasename("file.ts")).toBe("file.ts");
		expect(File.getBasename("src\\test\\file.ts")).toBe("file.ts");
	});

	it("should get relative path", () => {
		expect(File.getRelativePath("src/foo", "src/bar/file.ts")).toBe(
			"../bar/file.ts",
		);
		expect(File.getRelativePath("src", "src/test/file.ts")).toBe(
			"test/file.ts",
		);
	});
});
