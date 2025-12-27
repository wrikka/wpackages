import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { Commit } from "../types/index";
import { ChangelogService } from "./changelog.service";

vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(),
	writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";

const mockReadFile = readFile as Mock;
const mockWriteFile = writeFile as Mock;

describe("ChangelogService", () => {
	let service: ChangelogService;

	beforeEach(() => {
		service = new ChangelogService();
		vi.clearAllMocks();
	});

	describe("generate", () => {
		it("should generate changelog with features", async () => {
			const commits: Commit[] = [
				{
					hash: "abc123",
					type: "feat",
					subject: "add new feature",
					breaking: false,
				},
			];

			const changelog = await service.generate("1.0.0", commits);

			expect(changelog).toContain("## [1.0.0]");
			expect(changelog).toContain("Features");
			expect(changelog).toContain("add new feature");
			expect(changelog).toContain("abc123");
		});

		it("should group commits by type", async () => {
			const commits: Commit[] = [
				{ hash: "a", type: "feat", subject: "feature 1", breaking: false },
				{ hash: "b", type: "fix", subject: "fix 1", breaking: false },
				{ hash: "c", type: "feat", subject: "feature 2", breaking: false },
			];

			const changelog = await service.generate("1.0.0", commits);

			expect(changelog).toContain("Features");
			expect(changelog).toContain("Bug Fixes");
			expect(changelog).toContain("feature 1");
			expect(changelog).toContain("feature 2");
			expect(changelog).toContain("fix 1");
		});

		it("should handle breaking changes", async () => {
			const commits: Commit[] = [
				{
					hash: "abc",
					type: "feat",
					subject: "breaking feature",
					breaking: true,
				},
			];

			const changelog = await service.generate("2.0.0", commits);

			expect(changelog).toContain("BREAKING CHANGES");
			expect(changelog).toContain("breaking feature");
		});

		it("should include scope in changelog", async () => {
			const commits: Commit[] = [
				{
					hash: "abc",
					type: "feat",
					scope: "api",
					subject: "add endpoint",
					breaking: false,
				},
			];

			const changelog = await service.generate("1.0.0", commits);

			expect(changelog).toContain("(api)");
		});

		it("should handle commits without type", async () => {
			const commits: Commit[] = [
				{ hash: "abc", subject: "some change", breaking: false },
			];

			const changelog = await service.generate("1.0.0", commits);

			expect(changelog).toContain("some change");
		});
	});

	describe("update", () => {
		it("should create new changelog file", async () => {
			mockReadFile.mockRejectedValue(new Error("File not found"));

			await service.update("## [1.0.0]\n\n### Features\n");

			expect(mockWriteFile).toHaveBeenCalledWith(
				expect.stringContaining("CHANGELOG.md"),
				expect.stringContaining("# Changelog"),
			);
		});

		it("should insert into existing changelog", async () => {
			const existing = "# Changelog\n\n## [0.9.0]\n\n- Old feature\n";
			mockReadFile.mockResolvedValue(existing);

			await service.update("## [1.0.0]\n\n- New feature\n");

			expect(mockWriteFile).toHaveBeenCalledWith(
				expect.stringContaining("CHANGELOG.md"),
				expect.stringMatching(/1\.0\.0.*0\.9\.0/s),
			);
		});
	});
});
