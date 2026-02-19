import { describe, expect, it } from "vitest";
import {
	parseBranchLine,
	parseBranchName,
	parseCommitLine,
	parseGitUrl,
	parseRemoteLine,
	parseStashLine,
	parseStatusLine,
	splitLines,
} from "./parse.utils";

describe("parseGitUrl", () => {
	it("should parse SSH URL correctly", () => {
		expect(parseGitUrl("git@github.com:user/repo.git")).toEqual({ host: "github.com", owner: "user", repo: "repo" });
	});

	it("should parse HTTPS URL correctly", () => {
		expect(parseGitUrl("https://github.com/user/repo.git")).toEqual({
			host: "github.com",
			owner: "user",
			repo: "repo",
		});
	});

	it("should return null for invalid URL", () => {
		expect(parseGitUrl("invalid-url")).toBeNull();
	});
});

describe("parseBranchName", () => {
	it("should remove refs/heads/ prefix", () => {
		expect(parseBranchName("refs/heads/main")).toBe("main");
	});
});

describe("parseStatusLine", () => {
	it("should parse status line correctly", () => {
		expect(parseStatusLine(" M file.txt")).toEqual({ status: " M", file: "file.txt" });
	});
});

describe("parseCommitLine", () => {
	it("should parse commit line correctly", () => {
		const line = "hash|short|author|email|date|message";
		const commit = parseCommitLine(line);
		expect(commit?.hash).toBe("hash");
	});
});

describe("parseBranchLine", () => {
	it("should parse current branch line", () => {
		expect(parseBranchLine("* main|origin/main")).toEqual({ name: " main", current: true, remote: "origin/main" });
	});
});

describe("parseRemoteLine", () => {
	it("should parse remote line", () => {
		const line = "origin  git@github.com:user/repo.git (fetch)";
		expect(parseRemoteLine(line)).toEqual({ name: "origin", url: "git@github.com:user/repo.git", type: "fetch" });
	});
});

describe("parseStashLine", () => {
	it("should parse stash line correctly", () => {
		const line = "stash@{0}: On main: message";
		const stash = parseStashLine(line, 0);
		expect(stash?.message).toBe("message");
	});
});

describe("splitLines", () => {
	it("should split text into lines and remove empty ones", () => {
		expect(splitLines("line1\nline2\n\nline3")).toEqual(["line1", "line2", "line3"]);
	});
});
