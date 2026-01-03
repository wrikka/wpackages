// Git diff
export type GitDiff = {
	readonly file: string;
	readonly additions: number;
	readonly deletions: number;
	readonly changes: readonly string[];
};

// Git blame line
export type GitBlameLine = {
	readonly line: number;
	readonly hash: string;
	readonly author: string;
	readonly date: Date;
	readonly content: string;
};

// Git reflog entry
export type GitReflogEntry = {
	readonly hash: string;
	readonly shortHash: string;
	readonly action: string;
	readonly message: string;
	readonly date: Date;
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

// Git hook
export type GitHook = {
	readonly name: string;
	readonly path: string;
	readonly exists: boolean;
	readonly executable: boolean;
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
