// Git commit
export type GitCommit = {
	readonly hash: string;
	readonly shortHash: string;
	readonly author: string;
	readonly email: string;
	readonly date: Date;
	readonly message: string;
	readonly body?: string;
};

// Git branch
export type GitBranch = {
	readonly name: string;
	readonly current: boolean;
	readonly remote?: string;
};

// Git status
export type GitStatus = {
	readonly branch: string;
	readonly ahead: number;
	readonly behind: number;
	readonly staged: readonly string[];
	readonly modified: readonly string[];
	readonly untracked: readonly string[];
	readonly deleted: readonly string[];
};

// Git remote
export type GitRemote = {
	readonly name: string;
	readonly url: string;
	readonly type: "fetch" | "push";
};

// Git stash
export type GitStash = {
	readonly index: number;
	readonly branch: string;
	readonly message: string;
	readonly date: Date;
};

// Git worktree
export type GitWorktree = {
	readonly path: string;
	readonly branch: string;
	readonly commit: string;
	readonly locked: boolean;
	readonly prunable: boolean;
};

// Git submodule
export type GitSubmodule = {
	readonly path: string;
	readonly name: string;
	readonly url: string;
	readonly branch?: string;
	readonly commit: string;
	readonly status:
		| "uninitialized"
		| "initialized"
		| "up-to-date"
		| "modified"
		| "untracked";
};

// Git file info
export type GitFileInfo = {
	readonly path: string;
	readonly status: "added" | "modified" | "deleted" | "renamed" | "copied";
	readonly oldPath?: string;
};
