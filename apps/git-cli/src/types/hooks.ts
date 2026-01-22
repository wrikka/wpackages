// Git hook types
export type GitHookType =
	| "pre-commit"
	| "prepare-commit-msg"
	| "commit-msg"
	| "post-commit"
	| "pre-push"
	| "post-checkout"
	| "post-merge"
	| "pre-rebase"
	| "post-rewrite";

// Hook execution context
export interface HookContext {
	args: string[];
	stdin?: string;
	env?: Record<string, string>;
}

// Hook execution result
export interface HookResult {
	success: boolean;
	output?: string;
	error?: string;
	exitCode?: number;
}
