import { execa } from "execa";
import { access, constants, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import pc from "picocolors";
import type { GitHookType } from "../types/hooks";

// Predefined hook templates
export const HOOK_TEMPLATES: Record<GitHookType, string> = {
	"pre-commit": `#!/bin/sh
# Pre-commit hook
echo "🔍 Running pre-commit checks..."

# Add your pre-commit checks here
# Example: run linter, tests, etc.
# npm run lint
# npm run test

echo "✅ Pre-commit checks passed"
`,
	"commit-msg": `#!/bin/sh
# Commit message hook
echo "📝 Validating commit message..."

# Add your commit message validation here
# Example: check conventional commit format
# node validate-commit-msg.js "$1"

echo "✅ Commit message is valid"
`,
	"prepare-commit-msg": `#!/bin/sh
# Prepare commit message hook
echo "✍️ Preparing commit message..."

# Add your commit message preparation here
# Example: auto-add issue number, etc.

echo "✅ Commit message prepared"
`,
	"post-commit": `#!/bin/sh
# Post-commit hook
echo "🎉 Commit completed successfully!"

# Add your post-commit actions here
# Example: notify team, update changelog, etc.

echo "✅ Post-commit actions completed"
`,
	"pre-push": `#!/bin/sh
# Pre-push hook
echo "🚀 Running pre-push checks..."

# Add your pre-push checks here
# Example: run full test suite, security checks, etc.

echo "✅ Pre-push checks passed"
`,
	"post-checkout": `#!/bin/sh
# Post-checkout hook
echo "🔄 Checkout completed!"

# Add your post-checkout actions here
# Example: install dependencies, etc.

echo "✅ Post-checkout actions completed"
`,
	"post-merge": `#!/bin/sh
# Post-merge hook
echo "🔗 Merge completed!"

# Add your post-merge actions here
# Example: update dependencies, etc.

echo "✅ Post-merge actions completed"
`,
	"pre-rebase": `#!/bin/sh
# Pre-rebase hook
echo "🔄 Preparing to rebase..."

# Add your pre-rebase checks here
# Example: prevent rebasing published branches

echo "✅ Ready to rebase"
`,
	"post-rewrite": `#!/bin/sh
# Post-rewrite hook
echo "✏️ History rewrite completed!"

# Add your post-rewrite actions here

echo "✅ Post-rewrite actions completed"
`,
};

// Get the path to the .git/hooks directory
export async function getGitHooksDir(): Promise<string> {
	try {
		const { stdout } = await execa("git", ["rev-parse", "--git-dir"]);
		return resolve(stdout.trim(), "hooks");
	} catch {
		throw new Error("Not a git repository");
	}
}

// Check if a hook exists
export async function hookExists(hookName: GitHookType): Promise<boolean> {
	try {
		const hooksDir = await getGitHooksDir();
		const hookPath = resolve(hooksDir, hookName);
		await access(hookPath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

// Install a Git hook
export async function installHook(
	hookName: GitHookType,
	scriptContent: string,
	makeExecutable: boolean = true,
): Promise<void> {
	try {
		const hooksDir = await getGitHooksDir();
		const hookPath = resolve(hooksDir, hookName);

		// Ensure the script has a shebang
		let content = scriptContent;
		if (!content.startsWith("#!/bin/sh")) {
			content = `#!/bin/sh\n${content}`;
		}

		await writeFile(hookPath, content, { mode: makeExecutable ? 0o755 : 0o644 });
		console.log(pc.green(`✓ Installed ${hookName} hook`));
	} catch (error) {
		throw new Error(
			`Failed to install ${hookName} hook: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

// Remove a Git hook
export async function removeHook(hookName: GitHookType): Promise<void> {
	try {
		const hooksDir = await getGitHooksDir();
		const hookPath = resolve(hooksDir, hookName);

		try {
			await access(hookPath, constants.F_OK);
			await execa("rm", [hookPath]);
			console.log(pc.green(`✓ Removed ${hookName} hook`));
		} catch {
			console.log(pc.yellow(`⚠ ${hookName} hook not found`));
		}
	} catch (error) {
		throw new Error(`Failed to remove ${hookName} hook: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}

// List all installed hooks
export async function listHooks(): Promise<GitHookType[]> {
	try {
		const hooksDir = await getGitHooksDir();
		const { stdout } = await execa("ls", [hooksDir]);

		const files = stdout.split("\n").filter(Boolean);
		const hookTypes: GitHookType[] = [
			"pre-commit",
			"prepare-commit-msg",
			"commit-msg",
			"post-commit",
			"pre-push",
			"post-checkout",
			"post-merge",
			"pre-rebase",
			"post-rewrite",
		];

		return files.filter(file => hookTypes.includes(file as GitHookType)) as GitHookType[];
	} catch {
		return [];
	}
}

// Get hook content
export async function getHookContent(hookName: GitHookType): Promise<string> {
	try {
		const hooksDir = await getGitHooksDir();
		const hookPath = resolve(hooksDir, hookName);
		return await readFile(hookPath, "utf8");
	} catch (error) {
		throw new Error(`Failed to read ${hookName} hook: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}
