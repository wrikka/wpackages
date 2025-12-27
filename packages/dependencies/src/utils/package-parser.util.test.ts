import { describe, expect, it } from "vitest";
import { formatPackage, parsePackage, parsePackages } from "./package-parser.util";

describe("parsePackage", () => {
	it("should parse simple package name", () => {
		const result = parsePackage("react");
		expect(result).toEqual({ name: "react" });
	});

	it("should parse package with version", () => {
		const result = parsePackage("react@18.0.0");
		expect(result).toEqual({ name: "react", version: "18.0.0" });
	});

	it("should parse scoped package", () => {
		const result = parsePackage("@types/node");
		expect(result).toEqual({ name: "@types/node" });
	});

	it("should parse scoped package with version", () => {
		const result = parsePackage("@types/node@20.0.0");
		expect(result).toEqual({ name: "@types/node", version: "20.0.0" });
	});

	it("should parse package with semver range", () => {
		const result = parsePackage("react@^18.0.0");
		expect(result).toEqual({ name: "react", version: "^18.0.0" });
	});

	it("should parse package with complex version", () => {
		const result = parsePackage("react@>=18.0.0 <19.0.0");
		expect(result).toEqual({ name: "react", version: ">=18.0.0 <19.0.0" });
	});
});

describe("parsePackages", () => {
	it("should parse multiple packages", () => {
		const result = parsePackages(["react", "vue@3.0.0", "@types/node"]);
		expect(result).toEqual([{ name: "react" }, { name: "vue", version: "3.0.0" }, { name: "@types/node" }]);
	});

	it("should parse empty array", () => {
		const result = parsePackages([]);
		expect(result).toEqual([]);
	});
});

describe("formatPackage", () => {
	it("should format package without version", () => {
		const result = formatPackage({ name: "react" });
		expect(result).toBe("react");
	});

	it("should format package with version", () => {
		const result = formatPackage({ name: "react", version: "18.0.0" });
		expect(result).toBe("react@18.0.0");
	});

	it("should format scoped package", () => {
		const result = formatPackage({ name: "@types/node", version: "20.0.0" });
		expect(result).toBe("@types/node@20.0.0");
	});
});
