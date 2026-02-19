import { describe, expect, it } from "vitest";
import {
	isConventionalCommit,
	isValidBranchName,
	isValidCommitHash,
	isValidEmail,
	isValidFullHash,
	isValidGitUrl,
	isValidRemoteName,
	isValidSemVer,
	isValidShortHash,
	isValidTagName,
} from "./validate.utils";

describe("isValidCommitHash", () => {
	it("should validate a correct full hash", () => {
		expect(isValidCommitHash("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2")).toBe(true);
	});

	it("should validate a correct short hash", () => {
		expect(isValidCommitHash("a1b2c3d")).toBe(true);
	});

	it("should invalidate a hash that is too short", () => {
		expect(isValidCommitHash("a1b2c3")).toBe(false);
	});

	it("should invalidate a hash with invalid characters", () => {
		expect(isValidCommitHash("g1b2c3d")).toBe(false);
	});
});

describe("isValidShortHash", () => {
	it("should validate a correct short hash", () => {
		expect(isValidShortHash("a1b2c3d")).toBe(true);
	});
	it("should invalidate a hash that is not 7 characters", () => {
		expect(isValidShortHash("a1b2c3d4")).toBe(false);
	});
});

describe("isValidFullHash", () => {
	it("should validate a correct full hash", () => {
		expect(isValidFullHash("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2")).toBe(true);
	});
	it("should invalidate a hash that is not 40 characters", () => {
		expect(isValidFullHash("a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c")).toBe(false);
	});
});

describe("isValidBranchName", () => {
	it("should validate correct branch names", () => {
		expect(isValidBranchName("main")).toBe(true);
		expect(isValidBranchName("feature/new-stuff")).toBe(true);
	});
	it("should invalidate incorrect branch names", () => {
		expect(isValidBranchName("..invalid")).toBe(false);
		expect(isValidBranchName("invalid branch")).toBe(false);
	});
});

describe("isValidTagName", () => {
	it("should validate correct tag names", () => {
		expect(isValidTagName("v1.0.0")).toBe(true);
	});
});

describe("isValidRemoteName", () => {
	it("should validate correct remote names", () => {
		expect(isValidRemoteName("origin")).toBe(true);
	});
});

describe("isValidEmail", () => {
	it("should validate correct email", () => {
		expect(isValidEmail("test@example.com")).toBe(true);
	});
	it("should invalidate incorrect email", () => {
		expect(isValidEmail("test@.com")).toBe(false);
	});
});

describe("isValidGitUrl", () => {
	it("should validate SSH git URL", () => {
		expect(isValidGitUrl("git@github.com:user/repo.git")).toBe(true);
	});
	it("should validate HTTPS git URL", () => {
		expect(isValidGitUrl("https://github.com/user/repo.git")).toBe(true);
	});
});

describe("isConventionalCommit", () => {
	it("should validate conventional commit message", () => {
		expect(isConventionalCommit("feat: add new feature")).toBe(true);
	});
	it("should invalidate non-conventional commit message", () => {
		expect(isConventionalCommit("add new feature")).toBe(false);
	});
});

describe("isValidSemVer", () => {
	it("should validate semantic version", () => {
		expect(isValidSemVer("1.0.0")).toBe(true);
		expect(isValidSemVer("v2.3.4-alpha.1")).toBe(true);
	});
});
