// Git hooks constants
export const GIT_HOOKS = [
	"applypatch-msg",
	"pre-applypatch",
	"post-applypatch",
	"pre-commit",
	"pre-merge-commit",
	"prepare-commit-msg",
	"commit-msg",
	"post-commit",
	"pre-rebase",
	"post-checkout",
	"post-merge",
	"pre-push",
	"pre-receive",
	"update",
	"proc-receive",
	"post-receive",
	"post-update",
	"reference-transaction",
	"push-to-checkout",
	"pre-auto-gc",
	"post-rewrite",
	"sendemail-validate",
	"fsmonitor-watchman",
	"p4-changelist",
	"p4-prepare-changelist",
	"p4-post-changelist",
	"p4-pre-submit",
	"post-index-change",
] as const;

export type GitHookName = (typeof GIT_HOOKS)[number];

// Hook descriptions
export const HOOK_DESCRIPTIONS: Record<GitHookName, string> = {
	"applypatch-msg": "Invoked by git am; can edit the commit message",
	"commit-msg": "Invoked after commit message is written",
	"fsmonitor-watchman": "Invoked for fsmonitor integration",
	"p4-changelist": "Invoked by git-p4 submit",
	"p4-post-changelist": "Invoked after changelist is created",
	"p4-pre-submit": "Invoked before git-p4 submit",
	"p4-prepare-changelist": "Invoked after changelist is prepared",
	"post-applypatch": "Invoked by git am after patch is applied and committed",
	"post-checkout": "Invoked after checkout",
	"post-commit": "Invoked after commit is made",
	"post-index-change": "Invoked after index is written",
	"post-merge": "Invoked after merge",
	"post-receive": "Invoked on remote after all refs are updated",
	"post-rewrite": "Invoked after commits are rewritten",
	"post-update": "Invoked on remote after successful push",
	"pre-applypatch": "Invoked by git am before patch is applied",
	"pre-auto-gc": "Invoked before git gc --auto",
	"pre-commit": "Invoked before obtaining commit message",
	"pre-merge-commit": "Invoked before merge commit",
	"pre-push": "Invoked before push",
	"pre-rebase": "Invoked before rebase",
	"pre-receive": "Invoked on remote before refs are updated",
	"prepare-commit-msg": "Invoked before commit message editor is fired up",
	"proc-receive": "Invoked on remote for atomic push",
	"push-to-checkout": "Invoked on remote during push to checked-out branch",
	"reference-transaction": "Invoked during reference transaction",
	"sendemail-validate": "Invoked by git send-email",
	update: "Invoked on remote for each ref being updated",
};

// Common hook templates
export const HOOK_TEMPLATES = {
	"commit-msg": `#!/bin/sh
# Commit message hook
# Validates commit message format

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Check conventional commit format
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\\(.+?\\))?!?: .+"; then
    echo "Error: Commit message must follow conventional format"
    echo "Example: feat: add new feature"
    exit 1
fi

exit 0
`,
	"pre-commit": `#!/bin/sh
# Pre-commit hook
# Runs before commit is created

# Run linter
npm run lint || exit 1

# Run tests
npm test || exit 1

exit 0
`,
	"pre-push": `#!/bin/sh
# Pre-push hook
# Runs before push

# Run tests
npm test || exit 1

# Check branch name
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\\(.*\\),\\1,')
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    read -p "You're about to push to $current_branch. Are you sure? [y/n] " -n 1 -r < /dev/tty
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

exit 0
`,
} as const;

// Hook categories
export const HOOK_CATEGORIES = {
	checkout: ["post-checkout", "post-merge"],
	commit: [
		"pre-commit",
		"pre-merge-commit",
		"prepare-commit-msg",
		"commit-msg",
		"post-commit",
	],
	email: ["sendemail-validate"],
	fsmonitor: ["fsmonitor-watchman"],
	gc: ["pre-auto-gc"],
	index: ["post-index-change"],
	p4: [
		"p4-changelist",
		"p4-prepare-changelist",
		"p4-post-changelist",
		"p4-pre-submit",
	],
	patch: ["applypatch-msg", "pre-applypatch", "post-applypatch"],
	push: ["pre-push"],
	rebase: ["pre-rebase", "post-rewrite"],
	receive: [
		"pre-receive",
		"update",
		"proc-receive",
		"post-receive",
		"post-update",
	],
	reference: ["reference-transaction", "push-to-checkout"],
} as const;
