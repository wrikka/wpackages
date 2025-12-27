import { multiselect, select } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

async function getMergedBranches(): Promise<string[]> {
	try {
		const { stdout } = await execa("git", ["branch", "--merged"]);
		if (!stdout) return [];

		return stdout
			.split("\n")
			.map(line => line.replace("*", "").trim())
			.filter(Boolean)
			.filter(branch => branch !== "main" && branch !== "master" && branch !== "develop");
	} catch {
		return [];
	}
}

async function getStaleRemoteBranches(): Promise<string[]> {
	try {
		await execa("git", ["remote", "prune", "origin", "--dry-run"]);
		const { stdout } = await execa("git", ["branch", "-r", "--merged"]);
		if (!stdout) return [];

		return stdout
			.split("\n")
			.map(line => line.trim())
			.filter(Boolean)
			.filter(branch => !branch.includes("HEAD") && !branch.includes("main") && !branch.includes("master"));
	} catch {
		return [];
	}
}

async function getUntrackedFiles(): Promise<string[]> {
	try {
		const { stdout } = await execa("git", ["ls-files", "--others", "--exclude-standard"]);
		if (!stdout) return [];
		return stdout.split("\n").filter(Boolean);
	} catch {
		return [];
	}
}

export async function gitCleanupCommand(): Promise<void> {
	console.log(pc.bold(pc.blue("\n🧹 Git Cleanup")));
	console.log("");
	console.log(pc.dim("Analyzing repository..."));
	console.log("");

	const mergedBranches = await getMergedBranches();
	const staleBranches = await getStaleRemoteBranches();
	const untrackedFiles = await getUntrackedFiles();

	const cleanupOptions: Array<{ value: string; label: string; hint: string }> = [];

	if (mergedBranches.length > 0) {
		cleanupOptions.push({
			value: "merged-branches",
			label: `🌿 Delete merged branches (${mergedBranches.length})`,
			hint: "Remove local branches that have been merged",
		});
	}

	if (staleBranches.length > 0) {
		cleanupOptions.push({
			value: "stale-branches",
			label: `📡 Prune stale remote branches (${staleBranches.length})`,
			hint: "Remove references to deleted remote branches",
		});
	}

	if (untrackedFiles.length > 0) {
		cleanupOptions.push({
			value: "untracked-files",
			label: `📄 Remove untracked files (${untrackedFiles.length})`,
			hint: "Delete files not tracked by git",
		});
	}

	cleanupOptions.push(
		{
			value: "gc",
			label: "🗑️  Garbage collect",
			hint: "Optimize repository and cleanup unnecessary files",
		},
		{
			value: "prune",
			label: "✂️  Prune old objects",
			hint: "Remove unreachable objects",
		},
	);

	if (cleanupOptions.length === 2) {
		console.log(pc.green("✓ Repository is clean!"));
		console.log("");

		const gc = await select({
			message: "Run garbage collection?",
			options: [
				{ value: "yes", label: "Yes, optimize now" },
				{ value: "no", label: "No, skip" },
			],
		});

		if (gc === "yes") {
			console.log("");
			console.log(pc.cyan("Running garbage collection..."));
			await execa("git", ["gc", "--aggressive", "--prune=now"]);
			console.log(pc.green("✓ Repository optimized"));
		}
		return;
	}

	const selected = await multiselect({
		message: "Select cleanup operations:",
		options: cleanupOptions,
		required: false,
	}) as string[];

	if (!selected || selected.length === 0 || typeof selected === "symbol") {
		return;
	}

	console.log("");

	try {
		for (const operation of selected) {
			switch (operation) {
				case "merged-branches":
					console.log(pc.cyan("Deleting merged branches..."));
					for (const branch of mergedBranches) {
						try {
							await execa("git", ["branch", "-d", branch]);
							console.log(pc.green(`  ✓ Deleted: ${branch}`));
						} catch {
							console.log(pc.yellow(`  ⚠ Skipped: ${branch}`));
						}
					}
					break;

				case "stale-branches":
					console.log(pc.cyan("Pruning stale remote branches..."));
					await execa("git", ["remote", "prune", "origin"]);
					console.log(pc.green("  ✓ Pruned stale branches"));
					break;

				case "untracked-files":
					console.log(pc.cyan("Removing untracked files..."));
					console.log(pc.yellow("  Files to delete:"));
					untrackedFiles.slice(0, 10).forEach(file => {
						console.log(pc.dim(`    ${file}`));
					});
					if (untrackedFiles.length > 10) {
						console.log(pc.dim(`    ... and ${untrackedFiles.length - 10} more`));
					}

					const confirm = await select({
						message: "Confirm deletion?",
						options: [
							{ value: "yes", label: "Yes, delete them" },
							{ value: "no", label: "No, keep them" },
						],
					});

					if (confirm === "yes") {
						await execa("git", ["clean", "-fd"]);
						console.log(pc.green("  ✓ Removed untracked files"));
					} else {
						console.log(pc.yellow("  ⚠ Skipped untracked files"));
					}
					break;

				case "gc":
					console.log(pc.cyan("Running garbage collection..."));
					await execa("git", ["gc", "--aggressive", "--prune=now"]);
					console.log(pc.green("  ✓ Garbage collected"));
					break;

				case "prune":
					console.log(pc.cyan("Pruning old objects..."));
					await execa("git", ["prune"]);
					console.log(pc.green("  ✓ Pruned old objects"));
					break;
			}
		}

		console.log("");
		console.log(pc.green("✓ Cleanup completed!"));
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.log(pc.red(`✗ Cleanup failed: ${message}`));
	}

	console.log("");
}
