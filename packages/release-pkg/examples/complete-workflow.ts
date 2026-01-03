/**
 * Complete workflow example - full release pipeline
 */

import {
	AnalyticsService,
	ChangelogService,
	GitService,
	PreviewService,
	ReleaseOrchestrator,
	VersionService,
} from "release";

async function completeWorkflow() {
	console.log("🚀 Starting complete release workflow\n");

	// 1. Validate environment
	console.log("1️⃣ Validating environment...");
	const git = new GitService();

	const isGitRepo = await git.isGitRepository();
	if (!isGitRepo) {
		throw new Error("Not a git repository");
	}

	const hasChanges = await git.hasUncommittedChanges();
	if (hasChanges) {
		throw new Error("Uncommitted changes detected");
	}

	console.log("✅ Environment validated\n");

	// 2. Get current state
	console.log("2️⃣ Getting current state...");
	const version = new VersionService();
	void main(); // <--- Added void operator here
	const currentVersion = await version.getCurrentVersion();
	const packageInfo = await version.getPackageInfo();

	console.log(`Package: ${packageInfo.name}@${currentVersion}`);
	console.log(`✅ State retrieved\n`);

	// 3. Publish preview (if in PR)
	console.log("3️⃣ Publishing preview...");
	const preview = new PreviewService();

	try {
		const previewResult = await preview.publishPreview({
			ttl: 7,
		});

		console.log(`✅ Preview published: ${previewResult.url}`);
		console.log(`Install: ${previewResult.installCommand}\n`);

		// Track preview
		const analytics = new AnalyticsService();
		await analytics.trackEvent({
			type: "download",
			packageName: packageInfo.name,
			version: previewResult.version,
		});
	} catch (error) {
		if (process.env["DEBUG"]) {
			console.debug("Preview error:", error);
		}
		console.log("⏭️  Skipping preview (not in PR context)\n");
	}

	// 4. Generate changelog preview
	console.log("4️⃣ Generating changelog preview...");
	const changelog = new ChangelogService();
	const lastTag = await git.getLastTag();
	const commits = await git.getCommits(lastTag);

	console.log(`Found ${commits.length} commits since ${lastTag || "start"}`);

	const changelogPreview = await changelog.generate("preview", commits);
	console.log("\nChangelog preview:");
	console.log("---");
	console.log(changelogPreview);
	console.log("---\n");

	// 5. Confirm release
	console.log("5️⃣ Ready to release?");
	console.log("Press Enter to continue or Ctrl+C to cancel...");
	// In real scenario, use prompt library here

	// 6. Execute release
	console.log("\n6️⃣ Executing release...");
	const orchestrator = new ReleaseOrchestrator();

	const releaseResult = await orchestrator.release({
		type: "patch",
		verbose: true,
	});

	console.log("\n✅ Release completed!");
	console.log(`Version: ${releaseResult.previousVersion} → ${releaseResult.version}`);
	console.log(`Tag: ${releaseResult.tag}`);
	console.log(`Published: ${releaseResult.published}`);
	console.log(`Duration: ${releaseResult.duration}ms`);

	// 7. Post-release actions
	console.log("\n7️⃣ Post-release actions...");

	// Track release
	const releaseAnalytics = new AnalyticsService();
	await releaseAnalytics.trackEvent({
		type: "download",
		packageName: packageInfo.name,
		version: releaseResult.version,
	});

	console.log("✅ Analytics tracked");

	// Get stats
	const stats = await releaseAnalytics.getPreviewStats(
		packageInfo.name,
		releaseResult.version,
	);

	console.log("\n📊 Release Statistics:");
	console.log(`Downloads: ${stats.downloads}`);
	console.log(`Unique Users: ${stats.uniqueUsers}`);

	console.log("\n✨ Workflow completed successfully!");
}

// Run workflow
completeWorkflow().catch((error) => {
	console.error("\n❌ Workflow failed:");
	console.error(error);
	process.exit(1);
});
