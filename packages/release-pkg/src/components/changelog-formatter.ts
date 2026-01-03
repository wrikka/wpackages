import { COMMIT_TYPES } from "../constant/index";
import type { Commit } from "../types/index";

/**
 * Format a single commit line for changelog
 */
export function formatCommitLine(commit: Commit): string {
	let line = `- ${commit.subject}`;
	if (commit.scope) line += ` (${commit.scope})`;
	line += ` (${commit.hash.slice(0, 7)})`;
	return line;
}

/**
 * Format a section of commits with header
 */
export function formatCommitSection(
	title: string,
	emoji: string,
	commits: Commit[],
): string {
	if (commits.length === 0) return "";

	let section = `### ${emoji} ${title}\n\n`;
	for (const commit of commits) {
		section += `${formatCommitLine(commit)}\n`;
	}
	section += "\n";

	return section;
}

/**
 * Group commits by type
 */
export function groupCommitsByType(commits: Commit[]): Record<string, Commit[]> {
	const grouped: Record<string, Commit[]> = {};

	for (const commit of commits) {
		const type = commit.type || "chore";
		if (!grouped[type]) {
			grouped[type] = [];
		}
		grouped[type].push(commit);
	}

	return grouped;
}

/**
 * Generate changelog header
 */
export function generateChangelogHeader(version: string): string {
	const date = new Date().toISOString().split("T")[0];
	return `## [${version}] - ${date}\n\n`;
}

/**
 * Format breaking changes section
 */
export function formatBreakingChanges(commits: Commit[]): string {
	if (commits.length === 0) return "";

	let section = "### ⚠ BREAKING CHANGES\n\n";
	for (const commit of commits) {
		section += `${formatCommitLine(commit)}\n`;
	}
	section += "\n";

	return section;
}

/**
 * Format features section
 */
export function formatFeatures(commits: Commit[]): string {
	return formatCommitSection(
		COMMIT_TYPES.feat.title,
		COMMIT_TYPES.feat.emoji,
		commits,
	);
}

/**
 * Format bug fixes section
 */
export function formatBugFixes(commits: Commit[]): string {
	return formatCommitSection(
		COMMIT_TYPES.fix.title,
		COMMIT_TYPES.fix.emoji,
		commits,
	);
}

/**
 * Format other changes sections
 */
export function formatOtherChanges(commits: Commit[]): string {
	if (commits.length === 0) return "";

	const grouped = groupCommitsByType(commits);
	let section = "";

	for (const [type, typeCommits] of Object.entries(grouped)) {
		const typeInfo = COMMIT_TYPES[type as keyof typeof COMMIT_TYPES];
		if (typeInfo) {
			section += formatCommitSection(typeInfo.title, typeInfo.emoji, typeCommits);
		}
	}

	return section;
}
