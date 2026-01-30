/**
 * Git Error Types
 *
 * Custom error types for better error handling and debugging
 */

export class GitError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly details?: unknown,
	) {
		super(message);
		this.name = "GitError";
		Object.setPrototypeOf(this, GitError.prototype);
	}
}

export class GitCommandError extends GitError {
	constructor(
		message: string,
		public readonly command: string,
		public readonly exitCode: number,
		public readonly stderr?: string,
	) {
		super(message, "GIT_COMMAND_ERROR", { command, exitCode, stderr });
		this.name = "GitCommandError";
		Object.setPrototypeOf(this, GitCommandError.prototype);
	}
}

export class GitNotInstalledError extends GitError {
	constructor() {
		super("Git is not installed or not found in PATH", "GIT_NOT_INSTALLED");
		this.name = "GitNotInstalledError";
		Object.setPrototypeOf(this, GitNotInstalledError.prototype);
	}
}

export class GitRepositoryNotFoundError extends GitError {
	constructor(path: string) {
		super(`Git repository not found at: ${path}`, "GIT_REPOSITORY_NOT_FOUND", {
			path,
		});
		this.name = "GitRepositoryNotFoundError";
		Object.setPrototypeOf(this, GitRepositoryNotFoundError.prototype);
	}
}

export class GitConflictError extends GitError {
	constructor(
		message: string,
		public readonly conflicts: readonly string[],
	) {
		super(message, "GIT_CONFLICT", { conflicts });
		this.name = "GitConflictError";
		Object.setPrototypeOf(this, GitConflictError.prototype);
	}
}

export class GitValidationError extends GitError {
	constructor(
		message: string,
		public readonly field: string,
		public readonly value: unknown,
	) {
		super(message, "GIT_VALIDATION_ERROR", { field, value });
		this.name = "GitValidationError";
		Object.setPrototypeOf(this, GitValidationError.prototype);
	}
}

export class GitTimeoutError extends GitError {
	constructor(
		message: string,
		public readonly timeoutMs: number,
	) {
		super(message, "GIT_TIMEOUT", { timeoutMs });
		this.name = "GitTimeoutError";
		Object.setPrototypeOf(this, GitTimeoutError.prototype);
	}
}

/**
 * Check if error is a GitError
 */
export const isGitError = (error: unknown): error is GitError => {
	return error instanceof GitError;
};

/**
 * Check if error is a GitCommandError
 */
export const isGitCommandError = (error: unknown): error is GitCommandError => {
	return error instanceof GitCommandError;
};

/**
 * Get error message safely
 */
export const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
};

/**
 * Create a GitCommandError from spawn result
 */
export const createCommandError = (
	command: string,
	exitCode: number,
	stderr: string,
): GitCommandError => {
	return new GitCommandError(
		`Git command failed: ${command}`,
		command,
		exitCode,
		stderr,
	);
};
