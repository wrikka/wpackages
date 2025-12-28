/**
 * Standard messages for linter output
 */

export const MESSAGES = {
	FINDING_FILES: "🔍 Finding files to lint...",
	PARSING_FILES: "📝 Parsing source files...",
	LINTING_FILES: "🔎 Running lint rules...",
	FIXING_FILES: "🔧 Applying auto-fixes...",
	GENERATING_REPORT: "📊 Generating report...",
	SUCCESS: "✨ Linting completed successfully!",
	ERRORS_FOUND: "❌ Errors found",
	WARNINGS_FOUND: "⚠️  Warnings found",
	NO_ISSUES: "✅ No issues found",
} as const;

export const createFileMessage = (count: number): string =>
	`Found ${count} file${count !== 1 ? "s" : ""} to lint`;

export const createErrorMessage = (count: number): string =>
	`${count} error${count !== 1 ? "s" : ""}`;

export const createWarningMessage = (count: number): string =>
	`${count} warning${count !== 1 ? "s" : ""}`;

export const createFixableMessage = (count: number): string =>
	`${count} fixable`;
