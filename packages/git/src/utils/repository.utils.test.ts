import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, type Mock, vi } from "vitest";
import { getCurrentBranch, isGitRepository } from "./repository.utils";

vi.mock("node:child_process", () => ({ exec: vi.fn() }));
vi.mock("node:fs/promises", () => ({ stat: vi.fn() }));

describe("isGitRepository", () => {
	it("should return true if .git directory exists", async () => {
		(stat as Mock).mockResolvedValue({ isDirectory: () => true } as any);

		const result = await isGitRepository("/fake/path");
		expect(result).toBe(true);
		expect(stat).toHaveBeenCalledWith(join("/fake/path", ".git"));
	});

	it("should return false if .git does not exist", async () => {
		(stat as Mock).mockRejectedValue(new Error("File not found"));

		const result = await isGitRepository("/fake/path");
		expect(result).toBe(false);
	});

	it("should return false if .git is not a directory", async () => {
		(stat as Mock).mockResolvedValue({ isDirectory: () => false } as any);

		const result = await isGitRepository("/fake/path");
		expect(result).toBe(false);
	});
});

describe("getCurrentBranch", () => {
	it("should return the current branch name", async () => {
		(exec as unknown as Mock).mockImplementation((_cmd, _opts, cb) => cb(null, { stdout: "main\n" }));
		const branch = await getCurrentBranch("/fake/repo");
		expect(branch).toBe("main");
	});

	it("should return null if in a detached HEAD state", async () => {
		(exec as unknown as Mock).mockImplementation((_cmd, _opts, cb) => cb(null, { stdout: "HEAD\n" }));
		const branch = await getCurrentBranch("/fake/repo");
		expect(branch).toBeNull();
	});

	it("should return null if git command fails", async () => {
		(exec as unknown as Mock).mockImplementation((_cmd, _opts, cb) => cb(new Error("git error")));
		const branch = await getCurrentBranch("/fake/repo");
		expect(branch).toBeNull();
	});
});
