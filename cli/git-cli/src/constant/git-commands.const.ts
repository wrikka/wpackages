/**
 * Git command constants
 */

export const GIT_COMMANDS = {
	STATUS: ["status", "--porcelain"],
	DIFF: ["diff", "--cached"],
	ADD: ["add", "."],
	COMMIT: ["commit", "-m"],
	LOG: ["log", "--oneline", "-n", "20"],
	BRANCH: ["branch"],
	TAG: ["tag", "-l"],
	REMOTE: ["remote", "-v"],
	PUSH: ["push"],
	PULL: ["pull"],
	FETCH: ["fetch"],
	CHECKOUT: ["checkout"],
	MERGE: ["merge"],
	REBASE: ["rebase"],
	RESET: ["reset"],
	STASH: ["stash"],
	CLEAN: ["clean", "-fd"],
	REV_PARSE: ["rev-parse", "--git-dir"],
} as const;

export const GIT_HOOK_TYPES = [
	"pre-commit",
	"prepare-commit-msg",
	"commit-msg",
	"post-commit",
	"pre-push",
	"post-checkout",
	"post-merge",
	"pre-rebase",
	"post-rewrite",
] as const;

export const COMMIT_TYPES = {
	feat: "A new feature",
	fix: "A bug fix",
	docs: "Documentation changes",
	style: "Code style changes (formatting, etc.)",
	refactor: "Code refactoring",
	test: "Adding or updating tests",
	chore: "Maintenance tasks",
	perf: "Performance improvements",
} as const;

export const FILE_STATUS_ICONS = {
	Added: { icon: "+", color: "green" },
	Deleted: { icon: "−", color: "red" },
	Renamed: { icon: "→", color: "magenta" },
	Untracked: { icon: "?", color: "cyan" },
	Modified: { icon: "●", color: "yellow" },
	"Modified (staged)": { icon: "●", color: "green" },
} as const;
