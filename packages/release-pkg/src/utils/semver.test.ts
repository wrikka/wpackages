import { describe, expect, it } from "vitest";
import { compareVersions, formatVersion, incrementVersion, isValidVersion, parseVersion } from "./semver";

describe("parseVersion", () => {
	it("should parse basic version", () => {
		expect(parseVersion("1.2.3")).toEqual({
			major: 1,
			minor: 2,
			patch: 3,
			prerelease: undefined,
		});
	});

	it("should parse version with v prefix", () => {
		expect(parseVersion("v1.2.3")).toEqual({
			major: 1,
			minor: 2,
			patch: 3,
			prerelease: undefined,
		});
	});

	it("should parse prerelease version", () => {
		expect(parseVersion("1.2.3-beta.0")).toEqual({
			major: 1,
			minor: 2,
			patch: 3,
			prerelease: ["beta", "0"],
		});
	});

	it("should parse complex prerelease", () => {
		expect(parseVersion("2.0.0-alpha.1.2")).toEqual({
			major: 2,
			minor: 0,
			patch: 0,
			prerelease: ["alpha", "1", "2"],
		});
	});

	it("should handle missing parts", () => {
		expect(parseVersion("1")).toEqual({
			major: 1,
			minor: 0,
			patch: 0,
			prerelease: undefined,
		});
	});
});

describe("formatVersion", () => {
	it("should format basic version", () => {
		expect(
			formatVersion({ major: 1, minor: 2, patch: 3, prerelease: undefined }),
		).toBe("1.2.3");
	});

	it("should format prerelease version", () => {
		expect(
			formatVersion({ major: 1, minor: 2, patch: 3, prerelease: ["beta", "0"] }),
		).toBe("1.2.3-beta.0");
	});

	it("should handle empty prerelease array", () => {
		expect(
			formatVersion({ major: 1, minor: 0, patch: 0, prerelease: [] }),
		).toBe("1.0.0");
	});
});

describe("incrementVersion", () => {
	describe("major", () => {
		it("should increment major version", () => {
			expect(incrementVersion("1.2.3", "major")).toBe("2.0.0");
		});

		it("should reset minor and patch", () => {
			expect(incrementVersion("1.5.9", "major")).toBe("2.0.0");
		});

		it("should remove prerelease", () => {
			expect(incrementVersion("1.2.3-beta.0", "major")).toBe("2.0.0");
		});
	});

	describe("minor", () => {
		it("should increment minor version", () => {
			expect(incrementVersion("1.2.3", "minor")).toBe("1.3.0");
		});

		it("should reset patch", () => {
			expect(incrementVersion("1.2.9", "minor")).toBe("1.3.0");
		});

		it("should remove prerelease", () => {
			expect(incrementVersion("1.2.3-beta.0", "minor")).toBe("1.3.0");
		});
	});

	describe("patch", () => {
		it("should increment patch version", () => {
			expect(incrementVersion("1.2.3", "patch")).toBe("1.2.4");
		});

		it("should remove prerelease", () => {
			expect(incrementVersion("1.2.3-beta.0", "patch")).toBe("1.2.4");
		});
	});

	describe("premajor", () => {
		it("should create premajor version", () => {
			expect(incrementVersion("1.2.3", "premajor", "beta")).toBe("2.0.0-beta.0");
		});

		it("should use custom preid", () => {
			expect(incrementVersion("1.2.3", "premajor", "alpha")).toBe(
				"2.0.0-alpha.0",
			);
		});
	});

	describe("preminor", () => {
		it("should create preminor version", () => {
			expect(incrementVersion("1.2.3", "preminor", "beta")).toBe("1.3.0-beta.0");
		});
	});

	describe("prepatch", () => {
		it("should create prepatch version", () => {
			expect(incrementVersion("1.2.3", "prepatch", "beta")).toBe("1.2.4-beta.0");
		});
	});

	describe("prerelease", () => {
		it("should increment existing prerelease", () => {
			expect(incrementVersion("1.2.3-beta.0", "prerelease")).toBe(
				"1.2.3-beta.1",
			);
		});

		it("should create new prerelease", () => {
			expect(incrementVersion("1.2.3", "prerelease", "beta")).toBe(
				"1.2.4-beta.0",
			);
		});

		it("should increment numeric prerelease", () => {
			expect(incrementVersion("1.0.0-alpha.5", "prerelease")).toBe(
				"1.0.0-alpha.6",
			);
		});

		it("should append to non-numeric prerelease", () => {
			expect(incrementVersion("1.0.0-beta", "prerelease")).toBe("1.0.0-beta.0");
		});
	});
});

describe("compareVersions", () => {
	it("should compare major versions", () => {
		expect(compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
		expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
	});

	it("should compare minor versions", () => {
		expect(compareVersions("1.2.0", "1.1.0")).toBeGreaterThan(0);
		expect(compareVersions("1.1.0", "1.2.0")).toBeLessThan(0);
	});

	it("should compare patch versions", () => {
		expect(compareVersions("1.0.2", "1.0.1")).toBeGreaterThan(0);
		expect(compareVersions("1.0.1", "1.0.2")).toBeLessThan(0);
	});

	it("should compare equal versions", () => {
		expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
	});

	it("should handle release vs prerelease", () => {
		expect(compareVersions("1.0.0", "1.0.0-beta.0")).toBeGreaterThan(0);
		expect(compareVersions("1.0.0-beta.0", "1.0.0")).toBeLessThan(0);
	});

	it("should compare prerelease versions", () => {
		expect(compareVersions("1.0.0-beta.1", "1.0.0-beta.0")).toBeGreaterThan(0);
		expect(compareVersions("1.0.0-alpha.0", "1.0.0-beta.0")).toBeLessThan(0);
	});

	it("should compare prerelease lengths", () => {
		expect(compareVersions("1.0.0-beta.1.1", "1.0.0-beta.1")).toBeGreaterThan(
			0,
		);
	});
});

describe("isValidVersion", () => {
	it("should validate correct versions", () => {
		expect(isValidVersion("1.2.3")).toBe(true);
		expect(isValidVersion("0.0.0")).toBe(true);
		expect(isValidVersion("1.2.3-beta.0")).toBe(true);
		expect(isValidVersion("v1.2.3")).toBe(true);
	});

	it("should reject invalid versions", () => {
		expect(isValidVersion("abc")).toBe(false);
		expect(isValidVersion("1.2.x")).toBe(false);
		expect(isValidVersion("not-a-version")).toBe(false);
	});

	it("should accept partial versions", () => {
		expect(isValidVersion("1")).toBe(true);
		expect(isValidVersion("1.2")).toBe(true);
	});
});
