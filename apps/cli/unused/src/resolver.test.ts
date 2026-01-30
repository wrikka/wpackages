import { describe, expect, it } from "bun:test";
import { resolvePath } from "./resolver";
import type { ResolvedAlias } from "./tsconfig-loader";

describe("resolvePath", () => {
	const MOCK_FILES = new Set([
		"/project/src/index.ts",
		"/project/src/utils.ts",
		"/project/src/components/Button.tsx",
		"/project/src/components/index.ts",
		"/project/src/lib/auth/index.js",
		"/project/src/lib/auth/helper.js",
		"/project/node_modules/react/index.js",
	]);

	const ALIASES: ResolvedAlias[] = [
		{
			prefix: "@/",
			paths: ["/project/src"],
		},
		{
			prefix: "lib/",
			paths: ["/project/src/lib"],
		},
	];

	it("should resolve relative paths with extension", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("./utils.ts", importer, MOCK_FILES, []);
		expect(result).toBe("/project/src/utils.ts");
	});

	it("should resolve relative paths without extension", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("./utils", importer, MOCK_FILES, []);
		expect(result).toBe("/project/src/utils.ts");
	});

	it("should resolve to an index file in a directory", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("./components", importer, MOCK_FILES, []);
		expect(result).toBe("/project/src/components/index.ts");
	});

	it("should resolve path aliases", () => {
		const importer = "/project/src/components/Button.tsx";
		const result = resolvePath("@/utils", importer, MOCK_FILES, ALIASES);
		expect(result).toBe("/project/src/utils.ts");
	});

	it("should resolve complex path aliases to index files", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("lib/auth", importer, MOCK_FILES, ALIASES);
		expect(result).toBe("/project/src/lib/auth/index.js");
	});

	it("should return undefined for non-existent relative paths", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("./non-existent", importer, MOCK_FILES, []);
		expect(result).toBeUndefined();
	});

	it("should return undefined for non-existent alias paths", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("@/non-existent", importer, MOCK_FILES, ALIASES);
		expect(result).toBeUndefined();
	});

	it("should return undefined for external package imports", () => {
		const importer = "/project/src/index.ts";
		const result = resolvePath("react", importer, MOCK_FILES, ALIASES);
		expect(result).toBeUndefined();
	});
});
