import { describe, expect, it } from "vitest";
import { formatFileSize, getMimeType, isCodeFile, isTextFile } from "./file.utils";

describe("file.utils", () => {
	describe("isTextFile", () => {
		it("should identify text files", () => {
			expect(isTextFile("document.txt")).toBe(true);
			expect(isTextFile("readme.md")).toBe(true);
			expect(isTextFile("data.csv")).toBe(true);
		});

		it("should reject non-text files", () => {
			expect(isTextFile("script.ts")).toBe(false);
			expect(isTextFile("image.png")).toBe(false);
		});
	});

	describe("isCodeFile", () => {
		it("should identify code files", () => {
			expect(isCodeFile("script.ts")).toBe(true);
			expect(isCodeFile("index.js")).toBe(true);
			expect(isCodeFile("config.json")).toBe(true);
		});

		it("should reject non-code files", () => {
			expect(isCodeFile("document.txt")).toBe(false);
			expect(isCodeFile("image.png")).toBe(false);
		});
	});

	describe("formatFileSize", () => {
		it("should format bytes correctly", () => {
			expect(formatFileSize(0)).toBe("0 Bytes");
			expect(formatFileSize(1024)).toBe("1 KB");
			expect(formatFileSize(1048576)).toBe("1 MB");
		});
	});

	describe("getMimeType", () => {
		it("should return correct MIME types", () => {
			expect(getMimeType("file.json")).toBe("application/json");
			expect(getMimeType("image.png")).toBe("image/png");
			expect(getMimeType("document.pdf")).toBe("application/pdf");
		});

		it("should return default MIME type for unknown extensions", () => {
			expect(getMimeType("file.unknown")).toBe("application/octet-stream");
		});
	});
});
