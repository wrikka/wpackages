export const DEFAULT_REMOTE = "origin";
export const DEFAULT_BRANCH = "main";
export const DEFAULT_LOG_LIMIT = 10;

export const GIT_COMMANDS = {
	add: "git add",
	branch: "git branch",
	checkout: "git checkout",
	clone: "git clone",
	commit: "git commit",
	diff: "git diff",
	init: "git init",
	log: "git log",
	merge: "git merge",
	pull: "git pull",
	push: "git push",
	remote: "git remote",
	reset: "git reset",
	status: "git status",
	tag: "git tag",
} as const;
