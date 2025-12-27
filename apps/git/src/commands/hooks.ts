import { confirm, multiselect, select } from "@clack/prompts";
import pc from "picocolors";
import {
	getHookContent,
	HOOK_TEMPLATES,
	hookExists,
	installHook,
	listHooks,
	removeHook,
} from "../services/hooks.service";
import type { GitHookType } from "../types/hooks";

async function installHookCommand(): Promise<void> {
	const hookType = (await select({
		message: "Select hook type to install:",
		options: [
			{ value: "pre-commit", label: "pre-commit", hint: "Run before commit" },
			{ value: "commit-msg", label: "commit-msg", hint: "Validate commit message" },
			{ value: "prepare-commit-msg", label: "prepare-commit-msg", hint: "Prepare commit message" },
			{ value: "post-commit", label: "post-commit", hint: "Run after commit" },
			{ value: "pre-push", label: "pre-push", hint: "Run before push" },
			{ value: "post-checkout", label: "post-checkout", hint: "Run after checkout" },
			{ value: "post-merge", label: "post-merge", hint: "Run after merge" },
			{ value: "pre-rebase", label: "pre-rebase", hint: "Run before rebase" },
			{ value: "post-rewrite", label: "post-rewrite", hint: "Run after history rewrite" },
		],
	})) as GitHookType | symbol;

	if (typeof hookType === "symbol") return;

	const exists = await hookExists(hookType);
	if (exists) {
		const overwrite = await confirm({
			message: `Hook ${hookType} already exists. Overwrite?`,
			initialValue: false,
		});

		if (typeof overwrite === "symbol" || !overwrite) {
			console.log(pc.yellow("⚠ Hook installation cancelled"));
			return;
		}
	}

	try {
		await installHook(hookType, HOOK_TEMPLATES[hookType]);
		console.log(pc.green(`\n✅ ${hookType} hook installed successfully!`));
		console.log(pc.dim(`You can edit the hook at .git/hooks/${hookType}`));
	} catch (error) {
		console.log(pc.red(`\n❌ Failed to install ${hookType} hook`));
		console.error(error instanceof Error ? error.message : "Unknown error");
	}
}

async function removeHookCommand(): Promise<void> {
	const installedHooks = await listHooks();

	if (installedHooks.length === 0) {
		console.log(pc.yellow("⚠ No hooks installed"));
		return;
	}

	const hooksToRemove = (await multiselect({
		message: "Select hooks to remove:",
		options: installedHooks.map(hook => ({
			value: hook,
			label: hook,
		})),
		required: false,
	})) as GitHookType[] | symbol;

	if (typeof hooksToRemove === "symbol" || !hooksToRemove || hooksToRemove.length === 0) {
		console.log(pc.yellow("⚠ No hooks selected for removal"));
		return;
	}

	try {
		for (const hook of hooksToRemove) {
			await removeHook(hook);
		}
		console.log(pc.green("\n✅ Selected hooks removed successfully!"));
	} catch (error) {
		console.log(pc.red("\n❌ Failed to remove hooks"));
		console.error(error instanceof Error ? error.message : "Unknown error");
	}
}

async function listHooksCommand(): Promise<void> {
	try {
		const hooks = await listHooks();

		if (hooks.length === 0) {
			console.log(pc.yellow("⚠ No hooks installed"));
			return;
		}

		console.log(pc.bold(pc.green("\n📦 Installed Git Hooks:")));
		console.log("");

		for (const hook of hooks) {
			console.log(`  ${pc.cyan("•")} ${hook}`);
		}

		console.log("");
	} catch (error) {
		console.log(pc.red("❌ Failed to list hooks"));
		console.error(error instanceof Error ? error.message : "Unknown error");
	}
}

async function viewHookCommand(): Promise<void> {
	const installedHooks = await listHooks();

	if (installedHooks.length === 0) {
		console.log(pc.yellow("⚠ No hooks installed"));
		return;
	}

	const hookToView = (await select({
		message: "Select hook to view:",
		options: installedHooks.map(hook => ({
			value: hook,
			label: hook,
		})),
	})) as GitHookType | symbol;

	if (typeof hookToView === "symbol") return;

	try {
		const content = await getHookContent(hookToView);
		console.log(pc.bold(pc.green(`\n📄 ${hookToView} Hook Content:`)));
		console.log(pc.dim("=".repeat(50)));
		console.log(content);
		console.log(pc.dim("=".repeat(50)));
	} catch (error) {
		console.log(pc.red(`\n❌ Failed to view ${hookToView} hook`));
		console.error(error instanceof Error ? error.message : "Unknown error");
	}
}

export async function gitHooksCommand(): Promise<void> {
	const action = (await select({
		message: "Choose hook action:",
		options: [
			{ value: "install", label: "📥 Install Hook", hint: "Install a new Git hook" },
			{ value: "remove", label: "🗑️  Remove Hook", hint: "Remove existing Git hooks" },
			{ value: "list", label: "📋 List Hooks", hint: "List all installed hooks" },
			{ value: "view", label: "👀 View Hook", hint: "View hook content" },
		],
	})) as string | symbol;

	if (typeof action === "symbol") return;

	switch (action) {
		case "install":
			await installHookCommand();
			break;
		case "remove":
			await removeHookCommand();
			break;
		case "list":
			await listHooksCommand();
			break;
		case "view":
			await viewHookCommand();
			break;
		default:
			console.log(pc.red("❌ Unknown action"));
	}
}
