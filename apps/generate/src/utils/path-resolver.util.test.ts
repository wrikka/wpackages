import { describe, expect, it } from "vitest";
import {
	getDirectoryPath,
	getFileNameWithoutExtension,
	normalizePath,
	resolveDirectoryPath,
	resolveOutputPath,
} from "./path-resolver.util";

describe("path-resolver utils", () => {
	describe("resolveOutputPath", () => {
		it("should resolve path with kebab-case by default", () => {
			const result = resolveOutputPath("/out", "UserProfile");

			expect(result).toContain("user-profile.ts");
			expect(result).toContain("out");
		});

		it("should respect case style parameter", () => {
			const result = resolveOutputPath(
				"/out",
				"user-profile",
				"pascal",
				".tsx",
			);

			expect(result).toContain("UserProfile.tsx");
		});

		it("should handle custom extensions", () => {
			const result = resolveOutputPath("/out", "config", "kebab", ".json");

			expect(result).toContain("config.json");
		});
	});

	describe("resolveDirectoryPath", () => {
		it("should join path segments", () => {
			const result = resolveDirectoryPath("/base", "src", "components");

			expect(result).toContain("base");
			expect(result).toContain("src");
			expect(result).toContain("components");
		});
	});

	describe("getFileNameWithoutExtension", () => {
		it("should extract file name without extension", () => {
			expect(getFileNameWithoutExtension("/path/to/file.ts")).toBe("file");
			expect(getFileNameWithoutExtension("component.tsx")).toBe("component");
		});
	});

	describe("getDirectoryPath", () => {
		it("should extract directory path", () => {
			const result = getDirectoryPath("/path/to/file.ts");

			expect(result).toContain("path");
			expect(result).toContain("to");
		});
	});

	describe("normalizePath", () => {
		it("should normalize path separators", () => {
			expect(normalizePath("path\\to\\file.ts")).toBe("path/to/file.ts");
			expect(normalizePath("path/to/file.ts")).toBe("path/to/file.ts");
		});
	});
});
