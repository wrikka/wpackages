import { select } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";
import type { GitLogEntry } from "../types";

// Function to convert date to relative time
function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMinutes < 1) {
		return "now";
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes}m ago`;
	} else if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	} else if (diffInDays < 7) {
		return `${diffInDays}d ago`;
	} else {
		// For dates older than 1 week, show as short date
		return date.toLocaleDateString("en-US", {
			day: "numeric",
			month: "short",
			year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
		});
	}
}

// Function to truncate message if it's too long (adjusted length for new display format)
function truncateMessage(message: string, maxLength = 40): string {
	if (message.length <= maxLength) {
		return message;
	}
	return message.substring(0, maxLength - 3) + "...";
}

async function getGitLog(limit = 10): Promise<GitLogEntry[]> {
	try {
		const { stdout } = await execa("git", [
			"log",
			`--oneline`,
			`-n`,
			limit.toString(),
			"--pretty=format:%H|%s|%an|%ad",
			"--date=short",
		]);

		return stdout.split("\n").filter(Boolean).map(line => {
			const parts = line.split("|");
			return {
				hash: parts[0] || "",
				message: parts[1] || "",
				author: parts[2] || "",
				date: parts[3] || "",
			};
		});
	} catch {
		return [];
	}
}

async function showCommitActions(commit: GitLogEntry) {
	console.log("");
	console.log(pc.bold(pc.green(`📋 ${commit.message}`)));
	console.log(pc.dim(`Hash: ${pc.cyan(commit.hash.substring(0, 7))}`));
	console.log(pc.dim(`Author: ${pc.magenta(commit.author)} | Date: ${pc.yellow(formatRelativeTime(commit.date))}`));
	console.log("");

	const action = await select({
		message: "Choose an action:",
		options: [
			{ value: "diff", label: "📄 View Changes", hint: "See what changed in this commit" },
			{ value: "details", label: "📊 View Details", hint: "Full commit information" },
			{ value: "copy", label: "📋 Copy Hash", hint: "Copy commit hash to clipboard" },
			{ value: "checkout", label: "🔄 Checkout", hint: "Switch to this commit" },
			{ value: "create-branch", label: "🌿 Create Branch", hint: "Create new branch from this commit" },
			{ value: "cherry-pick", label: "🍒 Cherry Pick", hint: "Apply this commit to current branch" },
			{ value: "revert", label: "↩️  Revert Commit", hint: "Create a new commit that undoes this" },
			{ value: "amend", label: "✏️  Amend/Rename", hint: "Modify commit message or amend commit" },
			{
				value: "rebase-interactive",
				label: "🔀 Interactive Rebase",
				hint: "Start interactive rebase from this commit",
			},
			{ value: "create-tag", label: "🏷️  Create Tag", hint: "Create tag for this commit" },
			{ value: "export-patch", label: "📦 Export Patch", hint: "Export commit as patch file" },
			{ value: "reset", label: "🔄 Reset to Here", hint: "Reset HEAD to this commit" },
		],
	}) as string;

	if (typeof action === "symbol") {
		return;
	}

	console.log("");

	try {
		switch (action) {
			case "diff": {
				const { stdout: diff } = await execa("git", ["show", commit.hash, "--stat"]);
				console.log(pc.cyan("Changes:"));
				console.log(pc.dim(diff));
				break;
			}

			case "details": {
				const { stdout: details } = await execa("git", ["show", commit.hash, "--no-patch", "--format=fuller"]);
				console.log(pc.cyan("Full Details:"));
				console.log(pc.dim(details));
				break;
			}

			case "checkout":
				await execa("git", ["checkout", commit.hash]);
				console.log(pc.green(`✓ Checked out to commit: ${pc.cyan(commit.hash.substring(0, 7))}`));
				break;

			case "create-branch":
				await execa("git", ["checkout", "-b", `feature-${commit.hash.substring(0, 7)}`]);
				console.log(pc.green(`✓ Created and switched to branch: ${pc.blue(`feature-${commit.hash.substring(0, 7)}`)}`));
				break;

			case "cherry-pick":
				await execa("git", ["cherry-pick", commit.hash]);
				console.log(pc.green(`✓ Cherry-picked commit: ${pc.cyan(commit.hash.substring(0, 7))}`));
				break;

			case "amend": {
				// For amending, we need to check if this is the current HEAD
				const { stdout: headHash } = await execa("git", ["rev-parse", "HEAD"]);
				if (headHash.trim() === commit.hash) {
					await execa("git", ["commit", "--amend"]);
					console.log(pc.green(`✓ Amended current commit`));
				} else {
					console.log(pc.yellow(`⚠️  Can only amend current HEAD commit`));
				}
				break;
			}

			case "rebase-interactive":
				await execa("git", ["rebase", "-i", `${commit.hash}^`]);
				console.log(pc.green(`✓ Started interactive rebase from: ${pc.cyan(commit.hash.substring(0, 7))}`));
				break;

			case "create-tag": {
				const tagName = `v${Date.now()}`;
				await execa("git", ["tag", tagName, commit.hash]);
				console.log(
					pc.green(`✓ Created tag ${pc.blue(`'${tagName}'`)} for commit: ${pc.cyan(commit.hash.substring(0, 7))}`),
				);
				break;
			}

			case "export-patch":
				await execa("git", ["format-patch", "-1", commit.hash, "-o", "./patches"]);
				console.log(pc.green(`✓ Exported patch for commit: ${pc.cyan(commit.hash.substring(0, 7))}`));
				break;

			case "copy":
				// Windows clipboard command
				await execa("clip", { input: commit.hash });
				console.log(pc.green(`✓ Copied hash: ${pc.cyan(commit.hash.substring(0, 7))}`));
				break;

			case "revert": {
				const confirmRevert = await select({
					message: `Revert commit "${commit.message}"?`,
					options: [
						{ value: "yes", label: "Yes, revert it", hint: "Create revert commit" },
						{ value: "no", label: "No, cancel", hint: "Go back" },
					],
				});

				if (confirmRevert === "yes") {
					await execa("git", ["revert", "--no-edit", commit.hash]);
					console.log(pc.green(`✓ Reverted commit: ${pc.cyan(commit.hash.substring(0, 7))}`));
				}
				break;
			}

			case "reset": {
				const resetMode = await select({
					message: "Choose reset mode:",
					options: [
						{ value: "soft", label: "Soft", hint: "Keep changes staged" },
						{ value: "mixed", label: "Mixed", hint: "Keep changes unstaged" },
						{ value: "hard", label: "Hard", hint: "Discard all changes (⚠️ DANGEROUS)" },
						{ value: "cancel", label: pc.dim("Cancel"), hint: "Go back" },
					],
				});

				if (resetMode !== "cancel" && typeof resetMode === "string") {
					await execa("git", ["reset", `--${resetMode}`, commit.hash]);
					console.log(pc.green(`✓ Reset to commit: ${pc.cyan(commit.hash.substring(0, 7))}`));
				}
				break;
			}
		}
	} catch (error: any) {
		console.log(pc.red(`✗ Action failed: ${error.message}`));
	}

	console.log("");
}

export async function gitLogCommand(): Promise<void> {
	const logEntries = await getGitLog(20);

	if (logEntries.length === 0) {
		console.log(pc.red("✗ No commit history found"));
		return;
	}

	while (true) {
		const options = logEntries.map((entry) => ({
			label: `${pc.cyan(entry.hash.substring(0, 7))} - ${pc.yellow(formatRelativeTime(entry.date))} - ${
				pc.green(truncateMessage(entry.message))
			}`,
			value: entry.hash,
			hint: `${pc.magenta(entry.author)}`,
		}));

		console.log(pc.bold(pc.blue(`\n📜 Recent commit history (${logEntries.length} commits)`)));
		console.log("");

		const selectedHash = await select({
			message: "Select a commit:",
			options: options,
		}) as string;

		if (typeof selectedHash === "symbol") {
			return;
		}

		const selectedCommit = logEntries.find(e => e.hash === selectedHash);
		if (selectedCommit) {
			await showCommitActions(selectedCommit);
		}
	}
}
