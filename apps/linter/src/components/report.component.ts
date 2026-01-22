/**
 * Report Component - Pure functions for report generation
 *
 * Functional components that transform data without side effects
 */

import type { LintMessage, LintReport, LintResult } from "../types";

/**
 * Create a summary string from lint report
 */
export const createReportSummary = (report: LintReport): string => {
	const { errorCount, warningCount, filesLinted } = report;

	if (errorCount === 0 && warningCount === 0) {
		return `✅ All checks passed for ${filesLinted} file${filesLinted === 1 ? "" : "s"}`;
	}

	const parts = [];
	if (errorCount > 0) {
		parts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`);
	}
	if (warningCount > 0) {
		parts.push(`${warningCount} warning${warningCount === 1 ? "" : "s"}`);
	}

	return `❌ Found ${parts.join(" and ")} in ${filesLinted} file${filesLinted === 1 ? "" : "s"}`;
};

/**
 * Format a single lint message
 */
export const formatLintMessage = (message: LintMessage): string => {
	const { severity, message: msg, ruleId, line, column } = message;
	const severityIcon = severity === "error" ? "❌" : "⚠️";
	const location = line && column ? `:${line}:${column}` : "";

	return `${severityIcon} ${msg} (${ruleId})${location}`;
};

/**
 * Group messages by file from lint results
 */
export const groupMessagesByFile = (
	results: LintResult[],
): Record<string, LintMessage[]> => {
	return results.reduce(
		(acc, result) => {
			const file = result.filePath || "unknown";
			if (!acc[file]) acc[file] = [];
			acc[file].push(...result.messages);
			return acc;
		},
		{} as Record<string, LintMessage[]>,
	);
};

/**
 * Sort messages by severity and location
 */
export const sortMessages = (messages: LintMessage[]): LintMessage[] => {
	return [...messages].sort((a, b) => {
		// First by severity
		if (a.severity !== b.severity) {
			return a.severity === "error" ? -1 : 1;
		}

		// Then by line
		if (a.line !== b.line) {
			return (a.line || 0) - (b.line || 0);
		}

		// Finally by column
		return (a.column || 0) - (b.column || 0);
	});
};
