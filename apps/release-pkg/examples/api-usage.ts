/**
 * Advanced API usage example
 */

import {
	ChangelogService,
	compareVersions,
	GitService,
	incrementVersion,
	isValidVersion,
	parseVersion,
	VersionService,
} from "release";

async function main() {
	// Use individual services
	const versionService = new VersionService();
	const gitService = new GitService();
	const changelogService = new ChangelogService();

	// Get current version
	const currentVersion = await versionService.getCurrentVersion();
	console.log(`Current version: ${currentVersion}`);

	// Check if git repo
	const isGit = await gitService.isGitRepository();
	console.log(`Is git repo: ${isGit}`);

	// Get commits since last tag
	const lastTag = await gitService.getLastTag();
	const commits = await gitService.getCommits(lastTag);
	console.log(`Commits since ${lastTag}: ${commits.length}`);

	// Generate changelog
	const changelog = await changelogService.generate("1.0.0", commits);
	console.log("\nChangelog preview:");
	console.log(changelog);

	// Use semver utilities
	console.log("\nSemver utilities:");
	const version = parseVersion("1.2.3-beta.0");
	console.log("Parsed:", version);

	const nextVersion = incrementVersion("1.2.3", "minor");
	console.log("Next minor:", nextVersion);

	const isValid = isValidVersion("1.2.3");
	console.log("Is valid:", isValid);

	const comparison = compareVersions("2.0.0", "1.9.0");
	console.log("Compare 2.0.0 vs 1.9.0:", comparison > 0 ? "newer" : "older");
}

main();
