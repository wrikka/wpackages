import { describe, expect, it } from "vitest";
import { getBasename, getDirname, getExtname, getFilename, isAbsolutePath, joinPaths, parsePath } from "./path.utils";

describe("path.utils", () => {
	describe("joinPaths", () => {
		it("should join paths correctly", () => {
			expect(joinPaths("/home", "user", "file.txt")).toContain("file.txt");
			expect(joinPaths(".", "src", "index.ts")).toContain("index.ts");
		});
	});

	describe("getDirname", () => {
		it("should extract directory name", () => {
			expect(getDirname("/home/user/file.txt")).toBe("/home/user");
			expect(getDirname("file.txt")).toBe(".");
		});
	});

	describe("getBasename", () => {
		it("should extract base name", () => {
			expect(getBasename("/home/user/file.txt")).toBe("file.txt");
			expect(getBasename("/home/user/file.txt", ".txt")).toBe("file");
		});
	});

	describe("getExtname", () => {
		it("should extract extension", () => {
			expect(getExtname("file.txt")).toBe(".txt");
			expect(getExtname("file.test.ts")).toBe(".ts");
			expect(getExtname("file")).toBe("");
		});
	});

	describe("getFilename", () => {
		it("should extract filename without extension", () => {
			expect(getFilename("file.txt")).toBe("file");
			expect(getFilename("/path/to/file.test.ts")).toBe("file.test");
		});
	});

	describe("parsePath", () => {
		it("should parse path correctly", () => {
			const parsed = parsePath("/home/user/file.txt");
			expect(parsed.basename).toBe("file.txt");
			expect(parsed.filename).toBe("file");
			expect(parsed.extname).toBe(".txt");
		});
	});

	describe("isAbsolutePath", () => {
		it("should identify absolute paths", () => {
			expect(isAbsolutePath("/home/user")).toBe(true);
			expect(isAbsolutePath("C:\\Users\\user")).toBe(true);
		});

		it("should identify relative paths", () => {
			expect(isAbsolutePath("relative/path")).toBe(false);
			expect(isAbsolutePath("./file.txt")).toBe(false);
		});
	});
});
