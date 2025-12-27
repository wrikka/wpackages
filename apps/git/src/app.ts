#!/usr/bin/env node

import { intro, outro, select } from "@clack/prompts";
import { Command } from "commander";
import { gitBranchCommand } from "./commands/branch";
import { gitCleanupCommand } from "./commands/cleanup";
import { gitCommitCommand } from "./commands/commit";
import { gitHooksCommand } from "./commands/hooks";
import { gitLogCommand } from "./commands/log";
import { gitRemoteCommand } from "./commands/remote";
import { gitStagingCommand } from "./commands/staging";
import { gitStatusCommand } from "./commands/status";
import { gitTagCommand } from "./commands/tag";

const program = new Command();

program
	.name("git-cli")
	.description("Interactive Git CLI tool")
	.version("1.0.0");

program
	.command("status")
	.alias("s")
	.description("View current git status with interactive file selection")
	.action(async () => {
		await gitStatusCommand();
	});

program
	.command("add")
	.alias("a")
	.description("Stage files for commit")
	.action(async () => {
		await gitStagingCommand();
	});

program
	.command("commit")
	.alias("c")
	.description("Commit staged changes")
	.action(async () => {
		await gitCommitCommand();
	});

program
	.command("log")
	.alias("l")
	.description("Show commit history")
	.action(async () => {
		await gitLogCommand();
	});

program
	.command("remote")
	.alias("r")
	.description("Manage remote repositories")
	.action(async () => {
		await gitRemoteCommand();
	});

program
	.command("branch")
	.alias("b")
	.description("Manage branches")
	.action(async () => {
		await gitBranchCommand();
	});

program
	.command("tag")
	.alias("t")
	.description("Manage tags")
	.action(async () => {
		await gitTagCommand();
	});

program
	.command("cleanup")
	.alias("clean")
	.description("Cleanup repository")
	.action(async () => {
		await gitCleanupCommand();
	});

program
	.command("hooks")
	.description("Manage Git hooks")
	.action(async () => {
		await gitHooksCommand();
	});

async function showInteractiveMenu() {
	console.clear();
	intro("🚀 Git CLI Tool");

	try {
		const command = await select({
			message: "Choose a Git command:",
			options: [
				{ value: "status", label: "📋 Status", hint: "View current changes" },
				{ value: "add", label: "🔄 Stage", hint: "Stage files for commit" },
				{ value: "commit", label: "💾 Commit", hint: "Save staged changes" },
				{ value: "log", label: "📜 Log", hint: "Show commit history" },
				{ value: "branch", label: "🌿 Branch", hint: "Manage branches" },
				{ value: "tag", label: "🏷️  Tag", hint: "Manage tags" },
				{ value: "remote", label: "🌐 Remote", hint: "Manage remote repositories" },
				{ value: "hooks", label: "🎣 Hooks", hint: "Manage Git hooks" },
				{ value: "cleanup", label: "🧹 Cleanup", hint: "Clean repository" },
			],
		});

		if (typeof command === "symbol") {
			return;
		}

		switch (command) {
			case "status":
				await gitStatusCommand();
				break;
			case "add":
				await gitStagingCommand();
				break;
			case "commit":
				await gitCommitCommand();
				break;
			case "log":
				await gitLogCommand();
				break;
			case "remote":
				await gitRemoteCommand();
				break;
			case "branch":
				await gitBranchCommand();
				break;
			case "tag":
				await gitTagCommand();
				break;
			case "hooks":
				await gitHooksCommand();
				break;
			case "cleanup":
				await gitCleanupCommand();
				break;
		}
	} catch (error) {
		outro("❌ An error occurred. Please try again.");
		console.error(error);
	}
}

async function main() {
	if (process.argv.includes("--help") || process.argv.includes("-h")) {
		program.outputHelp();
		process.exit(0);
	}

	if (process.argv.length === 2) {
		await showInteractiveMenu();
	} else {
		program.parse();
	}
}

main();
