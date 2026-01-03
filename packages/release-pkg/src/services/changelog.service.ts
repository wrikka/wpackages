import { join } from "node:path";
import {
	formatBreakingChanges,
	formatBugFixes,
	formatFeatures,
	formatOtherChanges,
	generateChangelogHeader,
} from "../components/changelog-formatter";
import { DEFAULT_CHANGELOG_FILE } from "../constant/index";
import type { Commit } from "../types/index";
import { readTextFile, writeTextFile } from "../utils/file-system";

export class ChangelogService {
	async generate(version: string, commits: Commit[]): Promise<string> {
		let changelog = generateChangelogHeader(version);

		// Group commits
		const breaking = commits.filter((c) => c.breaking);
		const features = commits.filter((c) => c.type === "feat" && !c.breaking);
		const fixes = commits.filter((c) => c.type === "fix" && !c.breaking);
		const others = commits.filter(
			(c) => c.type !== "feat" && c.type !== "fix" && !c.breaking,
		);

		// Add sections
		changelog += formatBreakingChanges(breaking);
		changelog += formatFeatures(features);
		changelog += formatBugFixes(fixes);
		changelog += formatOtherChanges(others);

		return changelog;
	}

	async update(entry: string): Promise<void> {
		const changelogPath = join(process.cwd(), DEFAULT_CHANGELOG_FILE);

		// Read existing changelog or create new
		let existing = "";
		try {
			existing = await readTextFile(changelogPath);
		} catch {
			existing = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n";
		}

		// Insert new entry after header
		const lines = existing.split("\n");
		const headerEnd = lines.findIndex(
			(line, i) => i > 0 && line.startsWith("##"),
		);

		if (headerEnd > 0) {
			lines.splice(headerEnd, 0, entry);
		} else {
			lines.push(entry);
		}

		const newChangelog = lines.join("\n");
		await writeTextFile(changelogPath, newChangelog);
	}
}
