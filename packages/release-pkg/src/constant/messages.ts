/**
 * Error and info messages
 */

export const MESSAGES = {
	// Validation errors
	NOT_GIT_REPO: "Not a git repository",
	NO_REMOTE: "No git remote configured",
	UNCOMMITTED_CHANGES: "Working directory has uncommitted changes. Please commit or stash them first.",
	INVALID_VERSION: "Invalid version format",
	MISSING_PACKAGE_JSON: "package.json not found",
	MISSING_NAME_FIELD: "package.json is missing 'name' field",

	// Release errors
	RELEASE_TYPE_OR_VERSION_REQUIRED: "Release type or version must be specified",
	VERSION_ALREADY_PUBLISHED: "Version already published",
	RELEASE_FAILED: "Release failed",

	// File operation errors
	FAILED_READ_PACKAGE_JSON: "Failed to read package.json",
	FAILED_UPDATE_PACKAGE_JSON: "Failed to update package.json",
	FAILED_READ_CHANGELOG: "Failed to read CHANGELOG.md",
	FAILED_UPDATE_CHANGELOG: "Failed to update CHANGELOG.md",

	// Git operation errors
	GIT_COMMAND_FAILED: "Git command failed",
	COMMIT_FAILED: "Failed to commit changes",
	TAG_FAILED: "Failed to create tag",
	PUSH_FAILED: "Failed to push to remote",

	// NPM operation errors
	NPM_PUBLISH_FAILED: "Failed to publish to npm",
	NPM_VIEW_FAILED: "Failed to view npm package",

	// Interactive mode errors
	INTERACTIVE_MODE_FAILED: "Interactive mode failed, falling back to CLI mode",

	// Info messages
	DRY_RUN_MODE: "Dry run mode - no changes will be made",
	UPDATED_PACKAGE_JSON: "Updated package.json",
	UPDATED_CHANGELOG: "Updated CHANGELOG.md",
	COMMITTED_CHANGES: "Committed changes",
	CREATED_TAG: "Created tag",
	PUSHED_TO_REMOTE: "Pushed to remote",
	PUBLISHED_TO_NPM: "Published to npm",
	SUCCESSFULLY_RELEASED: "Successfully released",
} as const;

export type MessageKey = keyof typeof MESSAGES;

/**
 * Get message by key
 */
export const getMessage = (key: MessageKey): string => MESSAGES[key];

/**
 * Format message with variables
 */
export const formatMessage = (
	key: MessageKey,
	variables?: Record<string, string | number>,
): string => {
	let message: string = MESSAGES[key];
	if (variables) {
		Object.entries(variables).forEach(([k, v]) => {
			message = message.replace(`{${k}}`, String(v));
		});
	}
	return message;
};
