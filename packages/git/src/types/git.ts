import type { Result } from "functional";

// Re-export Result type for convenience
export type { Result };

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

// Git diff
export type GitDiff = {
	readonly file: string;
	readonly additions: number;
	readonly deletions: number;
	readonly changes: readonly string[];
};

// Git stash
export type GitStash = {
	readonly index: number;
	readonly branch: string;
	readonly message: string;
	readonly date: Date;
};

// Git reflog entry
export type GitReflogEntry = {
	readonly hash: string;
	readonly shortHash: string;
	readonly action: string;
	readonly message: string;
	readonly date: Date;
};

// Git blame line
export type GitBlameLine = {
	readonly line: number;
	readonly hash: string;
	readonly author: string;
	readonly date: Date;
	readonly content: string;
};

// Git file info
export type GitFileInfo = {
	readonly path: string;
	readonly status: "added" | "modified" | "deleted" | "renamed" | "copied";
	readonly oldPath?: string;
};

// Git worktree
export type GitWorktree = {
	readonly path: string;
	readonly branch: string;
	readonly commit: string;
	readonly locked: boolean;
	readonly prunable: boolean;
};

// Git hook
export type GitHook = {
	readonly name: string;
	readonly path: string;
	readonly exists: boolean;
	readonly executable: boolean;
};

// Git statistics
export type GitStats = {
	readonly totalCommits: number;
	readonly totalAuthors: number;
	readonly filesChanged: number;
	readonly insertions: number;
	readonly deletions: number;
	readonly mostActiveFiles: readonly { file: string; changes: number }[];
	readonly commitsByAuthor: readonly { author: string; count: number }[];
};

// Commit validation result
export type CommitValidation = {
	readonly valid: boolean;
	readonly errors: readonly string[];
	readonly warnings: readonly string[];
};

// Git config
export type GitConfig = {
	readonly cwd?: string;
	readonly author?: {
		readonly name: string;
		readonly email: string;
	};
};

// Git LFS types
export type GitLFSFile = {
	readonly path: string;
	readonly oid: string;
	readonly size: number;
};

export type GitLFSPointer = {
	readonly version: string;
	readonly oid: string;
	readonly size: number;
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

// Git conflict
export type GitConflict = {
	readonly file: string;
	readonly ours: string;
	readonly theirs: string;
	readonly base?: string;
};

// Git grep result
export type GitGrepResult = {
	readonly file: string;
	readonly line: number;
	readonly content: string;
	readonly match: string;
};

// File history entry
export type GitFileHistory = {
	readonly commit: string;
	readonly author: string;
	readonly date: Date;
	readonly message: string;
	readonly changes: "added" | "modified" | "deleted" | "renamed";
};

// GPG signature
export type GitSignature = {
	readonly valid: boolean;
	readonly keyId: string;
	readonly signer: string;
	readonly timestamp: Date;
	readonly status: "good" | "bad" | "expired" | "unknown";
};

// Git repository
export type GitRepository = {
	// Basic operations
	readonly init: () => Promise<Result<void, Error>>;
	readonly clone: (url: string, path?: string) => Promise<Result<void, Error>>;
	readonly add: (files: readonly string[]) => Promise<Result<void, Error>>;
	readonly commit: (
		message: string,
		body?: string,
	) => Promise<Result<string, Error>>;
	readonly push: (
		remote?: string,
		branch?: string,
		force?: boolean,
	) => Promise<Result<void, Error>>;
	readonly pull: (
		remote?: string,
		branch?: string,
		rebase?: boolean,
	) => Promise<Result<void, Error>>;
	readonly fetch: (
		remote?: string,
		branch?: string,
	) => Promise<Result<void, Error>>;

	// Status and history
	readonly status: () => Promise<Result<GitStatus, Error>>;
	readonly log: (
		limit?: number,
		branch?: string,
	) => Promise<Result<readonly GitCommit[], Error>>;
	readonly show: (hash: string) => Promise<Result<GitCommit, Error>>;
	readonly reflog: (
		limit?: number,
	) => Promise<Result<readonly GitReflogEntry[], Error>>;

	// Branch operations
	readonly branch: (
		name?: string,
	) => Promise<Result<readonly GitBranch[], Error>>;
	readonly deleteBranch: (
		name: string,
		force?: boolean,
	) => Promise<Result<void, Error>>;
	readonly renameBranch: (
		oldName: string,
		newName: string,
	) => Promise<Result<void, Error>>;
	readonly checkout: (
		branch: string,
		create?: boolean,
	) => Promise<Result<void, Error>>;
	readonly merge: (
		branch: string,
		noFf?: boolean,
	) => Promise<Result<void, Error>>;

	// Advanced operations
	readonly rebase: (
		branch: string,
		interactive?: boolean,
	) => Promise<Result<void, Error>>;
	readonly cherryPick: (hash: string) => Promise<Result<void, Error>>;
	readonly revert: (hash: string) => Promise<Result<void, Error>>;

	// Stash operations
	readonly stash: (
		message?: string,
		includeUntracked?: boolean,
	) => Promise<Result<void, Error>>;
	readonly stashList: () => Promise<Result<readonly GitStash[], Error>>;
	readonly stashPop: (index?: number) => Promise<Result<void, Error>>;
	readonly stashApply: (index?: number) => Promise<Result<void, Error>>;
	readonly stashDrop: (index?: number) => Promise<Result<void, Error>>;
	readonly stashClear: () => Promise<Result<void, Error>>;

	// Diff and changes
	readonly diff: (
		file?: string,
		cached?: boolean,
	) => Promise<Result<readonly GitDiff[], Error>>;
	readonly diffStat: (
		from?: string,
		to?: string,
	) => Promise<Result<string, Error>>;
	readonly blame: (
		file: string,
	) => Promise<Result<readonly GitBlameLine[], Error>>;

	// Remote operations
	readonly remote: () => Promise<Result<readonly GitRemote[], Error>>;
	readonly addRemote: (
		name: string,
		url: string,
	) => Promise<Result<void, Error>>;
	readonly removeRemote: (name: string) => Promise<Result<void, Error>>;
	readonly renameRemote: (
		oldName: string,
		newName: string,
	) => Promise<Result<void, Error>>;

	// Tag operations
	readonly tag: (
		name: string,
		message?: string,
		hash?: string,
	) => Promise<Result<void, Error>>;
	readonly deleteTag: (name: string) => Promise<Result<void, Error>>;
	readonly listTags: () => Promise<Result<readonly string[], Error>>;

	// Reset and clean
	readonly reset: (
		mode: "soft" | "mixed" | "hard",
		hash?: string,
	) => Promise<Result<void, Error>>;
	readonly clean: (
		force?: boolean,
		directories?: boolean,
	) => Promise<Result<void, Error>>;

	// Config
	readonly getConfig: (key: string) => Promise<Result<string, Error>>;
	readonly setConfig: (
		key: string,
		value: string,
		global?: boolean,
	) => Promise<Result<void, Error>>;

	// Apply patches
	readonly applyPatch: (patchFile: string) => Promise<Result<void, Error>>;
	readonly createPatch: (
		from?: string,
		to?: string,
	) => Promise<Result<string, Error>>;

	// Archive
	readonly archive: (
		output: string,
		format?: "tar" | "zip",
		ref?: string,
	) => Promise<Result<void, Error>>;

	// Submodule basics
	readonly submoduleInit: () => Promise<Result<void, Error>>;
	readonly submoduleUpdate: (
		recursive?: boolean,
	) => Promise<Result<void, Error>>;

	// Worktree operations
	readonly worktreeAdd: (
		path: string,
		branch: string,
		create?: boolean,
	) => Promise<Result<void, Error>>;
	readonly worktreeList: () => Promise<Result<readonly GitWorktree[], Error>>;
	readonly worktreeRemove: (
		path: string,
		force?: boolean,
	) => Promise<Result<void, Error>>;
	readonly worktreePrune: () => Promise<Result<void, Error>>;

	// Bisect operations
	readonly bisectStart: (
		bad: string,
		good: string,
	) => Promise<Result<void, Error>>;
	readonly bisectGood: () => Promise<Result<void, Error>>;
	readonly bisectBad: () => Promise<Result<void, Error>>;
	readonly bisectReset: () => Promise<Result<void, Error>>;

	// Hooks management
	readonly listHooks: () => Promise<Result<readonly GitHook[], Error>>;
	readonly installHook: (
		name: string,
		script: string,
	) => Promise<Result<void, Error>>;
	readonly removeHook: (name: string) => Promise<Result<void, Error>>;

	// Stats and insights
	readonly getStats: (
		since?: string,
		until?: string,
	) => Promise<Result<GitStats, Error>>;
	readonly getContributors: () => Promise<
		Result<readonly { name: string; email: string; commits: number }[], Error>
	>;

	// Commit validation
	readonly validateCommitMessage: (
		message: string,
	) => Promise<Result<CommitValidation, Error>>;
	readonly getLastCommitMessage: () => Promise<Result<string, Error>>;

	// New features
	// LFS operations
	readonly lfsInstall: () => Promise<Result<void, Error>>;
	readonly lfsTrack: (pattern: string) => Promise<Result<void, Error>>;
	readonly lfsUntrack: (pattern: string) => Promise<Result<void, Error>>;
	readonly lfsLs: () => Promise<Result<readonly GitLFSFile[], Error>>;
	readonly lfsPull: () => Promise<Result<void, Error>>;
	readonly lfsPush: () => Promise<Result<void, Error>>;

	// Advanced submodule operations
	readonly submoduleAdd: (
		url: string,
		path: string,
	) => Promise<Result<void, Error>>;
	readonly submoduleRemove: (path: string) => Promise<Result<void, Error>>;
	readonly submoduleList: () => Promise<Result<readonly GitSubmodule[], Error>>;
	readonly submoduleForeach: (
		command: string,
	) => Promise<Result<string, Error>>;
	readonly submoduleSync: () => Promise<Result<void, Error>>;

	// Conflict resolution
	readonly getConflicts: () => Promise<Result<readonly GitConflict[], Error>>;
	readonly resolveConflict: (
		file: string,
		resolution: "ours" | "theirs",
	) => Promise<Result<void, Error>>;
	readonly abortMerge: () => Promise<Result<void, Error>>;
	readonly continueMerge: () => Promise<Result<void, Error>>;

	// Search operations
	readonly grep: (
		pattern: string,
		options?: { ignoreCase?: boolean; lineNumber?: boolean },
	) => Promise<Result<readonly GitGrepResult[], Error>>;
	readonly searchCommits: (
		query: string,
	) => Promise<Result<readonly GitCommit[], Error>>;

	// File history
	readonly fileHistory: (
		file: string,
		limit?: number,
	) => Promise<Result<readonly GitFileHistory[], Error>>;
	readonly fileBlame: (
		file: string,
	) => Promise<Result<readonly GitBlameLine[], Error>>;

	// Commit operations
	readonly amendCommit: (message?: string) => Promise<Result<void, Error>>;
	readonly fixupCommit: (hash: string) => Promise<Result<void, Error>>;
	readonly squashCommit: (hash: string) => Promise<Result<void, Error>>;

	// GPG signing
	readonly signCommit: (
		message: string,
		body?: string,
	) => Promise<Result<string, Error>>;
	readonly verifyCommit: (hash: string) => Promise<Result<GitSignature, Error>>;
	readonly listSignedCommits: (
		limit?: number,
	) => Promise<Result<readonly GitCommit[], Error>>;
};
