// Validation utilities for Git data

// Validate commit hash (SHA-1: 40 hex chars or short: 7-40 chars)
export const isValidCommitHash = (hash: string): boolean => {
	return /^[0-9a-f]{7,40}$/.test(hash);
};

// Validate short commit hash
export const isValidShortHash = (hash: string): boolean => {
	return /^[0-9a-f]{7}$/.test(hash);
};

// Validate full commit hash
export const isValidFullHash = (hash: string): boolean => {
	return /^[0-9a-f]{40}$/.test(hash);
};

// Validate branch name
export const isValidBranchName = (name: string): boolean => {
	// Git branch naming rules
	if (!name || name.length === 0) return false;
	if (name.startsWith("/") || name.endsWith("/")) return false;
	if (name.startsWith(".") || name.endsWith(".")) return false;
	if (name.includes("..")) return false;
	if (name.includes("//")) return false;
	if (/[\s~^:?*[\\]/.test(name)) return false;
	if (name.includes("@{")) return false;
	if (name === "@") return false;

	return true;
};

// Validate tag name
export const isValidTagName = (name: string): boolean => {
	return isValidBranchName(name);
};

// Validate remote name
export const isValidRemoteName = (name: string): boolean => {
	if (!name || name.length === 0) return false;
	if (/[\s~^:?*[\\]/.test(name)) return false;

	return true;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Validate URL (git URL)
export const isValidGitUrl = (url: string): boolean => {
	// SSH format: git@host:path or user@host:path
	if (/^[a-z0-9_-]+@[a-z0-9.-]+:.+/.test(url)) return true;

	// HTTP/HTTPS format
	if (/^https?:\/\/.+/.test(url)) return true;

	// Git protocol
	if (/^git:\/\/.+/.test(url)) return true;

	// File protocol
	if (/^file:\/\/.+/.test(url)) return true;

	// Local path
	if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
		return true;
	}

	return false;
};

// Validate commit message (basic)
export const isValidCommitMessage = (message: string): boolean => {
	if (!message || message.trim().length === 0) return false;

	// Subject line shouldn't be too long
	const firstLine = message.split("\n")[0];
	if (firstLine && firstLine.length > 100) return false;

	return true;
};

// Validate conventional commit message
export const isConventionalCommit = (message: string): boolean => {
	const pattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+?\))?!?: .+/;
	const firstLine = message.split("\n")[0];
	return firstLine ? pattern.test(firstLine) : false;
};

// Validate semantic version
export const isValidSemVer = (version: string): boolean => {
	const semverRegex =
		/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
	return semverRegex.test(version);
};

// Validate file path
export const isValidFilePath = (path: string): boolean => {
	if (!path || path.length === 0) return false;

	// Check for invalid characters (null, carriage return, newline)
	// eslint-disable-next-line no-control-regex
	if (/[\0\r\n]/.test(path)) return false;

	return true;
};

// Validate glob pattern
export const isValidGlobPattern = (pattern: string): boolean => {
	if (!pattern || pattern.length === 0) return false;

	try {
		// Basic validation - just check it's not empty and doesn't have invalid chars
		return /^[^<>"|]+$/.test(pattern);
	} catch {
		return false;
	}
};

// Check if ref exists
export const isValidRef = (ref: string): boolean => {
	if (!ref || ref.length === 0) return false;
	if (ref === "HEAD") return true;
	if (ref.startsWith("refs/")) return true;

	return (
		isValidBranchName(ref) || isValidTagName(ref) || isValidCommitHash(ref)
	);
};

// Validate GPG key ID
export const isValidGPGKeyId = (keyId: string): boolean => {
	// GPG key IDs are typically 8, 16, or 40 hex characters
	return /^[0-9A-Fa-f]{8,40}$/.test(keyId);
};

// Validate stash reference
export const isValidStashRef = (ref: string): boolean => {
	return /^stash@\{\d+\}$/.test(ref) || ref === "stash";
};

// Check if string is empty or whitespace
export const isEmpty = (str: string): boolean => {
	return !str || str.trim().length === 0;
};

// Check if string is non-empty
export const isNonEmpty = (str: string): boolean => {
	return !isEmpty(str);
};

// Validate config key
export const isValidConfigKey = (key: string): boolean => {
	// Git config keys format: section.subsection.key
	return /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/i.test(key);
};

// Validate directory path
export const isValidDirectory = (path: string): boolean => {
	if (!path || path.length === 0) return false;

	// Basic check - actual existence should be checked by fs
	// eslint-disable-next-line no-control-regex
	return /^[^<>"|?*\0]+$/.test(path);
};

// Validate hook name
export const isValidHookName = (name: string): boolean => {
	const validHooks = [
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
	];

	return validHooks.includes(name);
};

// Validate reset mode
export const isValidResetMode = (mode: string): boolean => {
	return ["soft", "mixed", "hard", "merge", "keep"].includes(mode);
};

// Validate merge strategy
export const isValidMergeStrategy = (strategy: string): boolean => {
	return ["resolve", "recursive", "octopus", "ours", "subtree"].includes(
		strategy,
	);
};

// Ensure value is string
export const ensureString = (value: unknown): string => {
	if (value === null) {
		return "";
	}
	switch (typeof value) {
		case "string":
			return value;
		case "number":
		case "boolean":
		case "bigint":
		case "symbol":
		case "function":
			return value.toString();
		case "object":
			return JSON.stringify(value);
		case "undefined":
			return "";
		default:
			// This case should be unreachable for known JS types
			return "";
	}
};

// Check if value is string
export const isString = (value: unknown): value is string => {
	return typeof value === "string";
};
