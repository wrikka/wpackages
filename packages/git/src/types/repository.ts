import { Effect, Option } from "effect";
import type { GitError } from "../errors";
import type { GitBranch, GitCommit, GitRemote, GitStash, GitStatus, GitSubmodule, GitWorktree } from "./objects";
import type {
	CommitValidation,
	GitBlameLine,
	GitConflict,
	GitDiff,
	GitFileHistory,
	GitGrepResult,
	GitHook,
	GitLFSFile,
	GitReflogEntry,
	GitSignature,
	GitStats,
} from "./operations";

// Git repository using Effect-TS
export type GitRepository = {
	// Repository info
	readonly isGitRepository: () => Effect.Effect<boolean, never>;
	readonly getCurrentBranch: () => Effect.Effect<Option.Option<string>, GitError>;

	// Basic operations
	readonly init: () => Effect.Effect<void, GitError>;
	readonly clone: (url: string, path?: string) => Effect.Effect<void, GitError>;
	readonly add: (files: readonly string[]) => Effect.Effect<void, GitError>;
	readonly commit: (message: string, body?: string) => Effect.Effect<string, GitError>;
	readonly push: (remote?: string, branch?: string, force?: boolean) => Effect.Effect<void, GitError>;
	readonly pull: (remote?: string, branch?: string, rebase?: boolean) => Effect.Effect<void, GitError>;
	readonly fetch: (remote?: string, branch?: string) => Effect.Effect<void, GitError>;

	// Status and history
	readonly status: () => Effect.Effect<GitStatus, GitError>;
	readonly log: (limit?: number, branch?: string) => Effect.Effect<readonly GitCommit[], GitError>;
	readonly show: (hash: string) => Effect.Effect<GitCommit, GitError>;
	readonly reflog: (limit?: number) => Effect.Effect<readonly GitReflogEntry[], GitError>;

	// Branch operations
	readonly branch: (name?: string) => Effect.Effect<readonly GitBranch[], GitError>;
	readonly deleteBranch: (name: string, force?: boolean) => Effect.Effect<void, GitError>;
	readonly renameBranch: (oldName: string, newName: string) => Effect.Effect<void, GitError>;
	readonly checkout: (branch: string, create?: boolean) => Effect.Effect<void, GitError>;
	readonly merge: (branch: string, noFf?: boolean) => Effect.Effect<void, GitError>;

	// Advanced operations
	readonly rebase: (branch: string, interactive?: boolean) => Effect.Effect<void, GitError>;
	readonly cherryPick: (hash: string) => Effect.Effect<void, GitError>;
	readonly revert: (hash: string) => Effect.Effect<void, GitError>;

	// Stash operations
	readonly stash: (message?: string, includeUntracked?: boolean) => Effect.Effect<void, GitError>;
	readonly stashList: () => Effect.Effect<readonly GitStash[], GitError>;
	readonly stashPop: (index?: number) => Effect.Effect<void, GitError>;
	readonly stashApply: (index?: number) => Effect.Effect<void, GitError>;
	readonly stashDrop: (index?: number) => Effect.Effect<void, GitError>;
	readonly stashClear: () => Effect.Effect<void, GitError>;

	// Diff and changes
	readonly diff: (file?: string, cached?: boolean) => Effect.Effect<readonly GitDiff[], GitError>;
	readonly diffStat: (from?: string, to?: string) => Effect.Effect<string, GitError>;
	readonly blame: (file: string) => Effect.Effect<readonly GitBlameLine[], GitError>;

	// Remote operations
	readonly remote: () => Effect.Effect<readonly GitRemote[], GitError>;
	readonly addRemote: (name: string, url: string) => Effect.Effect<void, GitError>;
	readonly removeRemote: (name: string) => Effect.Effect<void, GitError>;
	readonly renameRemote: (oldName: string, newName: string) => Effect.Effect<void, GitError>;

	// Tag operations
	readonly tag: (name: string, message?: string, hash?: string) => Effect.Effect<void, GitError>;
	readonly deleteTag: (name: string) => Effect.Effect<void, GitError>;
	readonly listTags: () => Effect.Effect<readonly string[], GitError>;

	// Reset and clean
	readonly reset: (mode: "soft" | "mixed" | "hard", hash?: string) => Effect.Effect<void, GitError>;
	readonly clean: (force?: boolean, directories?: boolean) => Effect.Effect<void, GitError>;

	// Config
	readonly getConfig: (key: string) => Effect.Effect<string, GitError>;
	readonly setConfig: (key: string, value: string, global?: boolean) => Effect.Effect<void, GitError>;

	// Apply patches
	readonly applyPatch: (patchFile: string) => Effect.Effect<void, GitError>;
	readonly createPatch: (from?: string, to?: string) => Effect.Effect<string, GitError>;

	// Archive
	readonly archive: (output: string, format?: "tar" | "zip", ref?: string) => Effect.Effect<void, GitError>;

	// Submodule basics
	readonly submoduleInit: () => Effect.Effect<void, GitError>;
	readonly submoduleUpdate: (recursive?: boolean) => Effect.Effect<void, GitError>;

	// Worktree operations
	readonly worktreeAdd: (path: string, branch: string, create?: boolean) => Effect.Effect<void, GitError>;
	readonly worktreeList: () => Effect.Effect<readonly GitWorktree[], GitError>;
	readonly worktreeRemove: (path: string, force?: boolean) => Effect.Effect<void, GitError>;
	readonly worktreePrune: () => Effect.Effect<void, GitError>;

	// Bisect operations
	readonly bisectStart: (bad: string, good: string) => Effect.Effect<void, GitError>;
	readonly bisectGood: () => Effect.Effect<void, GitError>;
	readonly bisectBad: () => Effect.Effect<void, GitError>;
	readonly bisectReset: () => Effect.Effect<void, GitError>;

	// Hooks management
	readonly listHooks: () => Effect.Effect<readonly GitHook[], GitError>;
	readonly installHook: (name: string, script: string) => Effect.Effect<void, GitError>;
	readonly removeHook: (name: string) => Effect.Effect<void, GitError>;

	// Stats and insights
	readonly getStats: (since?: string, until?: string) => Effect.Effect<GitStats, GitError>;
	readonly getContributors: () => Effect.Effect<readonly { name: string; email: string; commits: number }[], GitError>;

	// Commit validation
	readonly validateCommitMessage: (message: string) => Effect.Effect<CommitValidation, GitError>;
	readonly getLastCommitMessage: () => Effect.Effect<string, GitError>;

	// LFS operations
	readonly lfsInstall: () => Effect.Effect<void, GitError>;
	readonly lfsTrack: (pattern: string) => Effect.Effect<void, GitError>;
	readonly lfsUntrack: (pattern: string) => Effect.Effect<void, GitError>;
	readonly lfsLs: () => Effect.Effect<readonly GitLFSFile[], GitError>;
	readonly lfsPull: () => Effect.Effect<void, GitError>;
	readonly lfsPush: () => Effect.Effect<void, GitError>;

	// Advanced submodule operations
	readonly submoduleAdd: (url: string, path: string) => Effect.Effect<void, GitError>;
	readonly submoduleRemove: (path: string) => Effect.Effect<void, GitError>;
	readonly submoduleList: () => Effect.Effect<readonly GitSubmodule[], GitError>;
	readonly submoduleForeach: (command: string) => Effect.Effect<string, GitError>;
	readonly submoduleSync: () => Effect.Effect<void, GitError>;

	// Conflict resolution
	readonly getConflicts: () => Effect.Effect<readonly GitConflict[], GitError>;
	readonly resolveConflict: (file: string, resolution: "ours" | "theirs") => Effect.Effect<void, GitError>;
	readonly abortMerge: () => Effect.Effect<void, GitError>;
	readonly continueMerge: () => Effect.Effect<void, GitError>;

	// Search operations
	readonly grep: (
		pattern: string,
		options?: { ignoreCase?: boolean; lineNumber?: boolean },
	) => Effect.Effect<readonly GitGrepResult[], GitError>;
	readonly searchCommits: (query: string) => Effect.Effect<readonly GitCommit[], GitError>;

	// File history
	readonly fileHistory: (file: string, limit?: number) => Effect.Effect<readonly GitFileHistory[], GitError>;
	readonly fileBlame: (file: string) => Effect.Effect<readonly GitBlameLine[], GitError>;

	// Commit operations
	readonly amendCommit: (message?: string) => Effect.Effect<void, GitError>;
	readonly fixupCommit: (hash: string) => Effect.Effect<void, GitError>;
	readonly squashCommit: (hash: string) => Effect.Effect<void, GitError>;

	// GPG signing
	readonly signCommit: (message: string, body?: string) => Effect.Effect<string, GitError>;
	readonly verifyCommit: (hash: string) => Effect.Effect<GitSignature, GitError>;
	readonly listSignedCommits: (limit?: number) => Effect.Effect<readonly GitCommit[], GitError>;
};
