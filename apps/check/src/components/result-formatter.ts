import { COLORS, SEVERITY_COLORS, SEVERITY_SYMBOLS, STATUS_COLORS, STATUS_SYMBOLS } from "../constant/index";
import type { CheckIssue, CheckResult, CheckResults } from "../types/index";

export const formatCheckResult = (result: CheckResult): string => {
	const statusColor = STATUS_COLORS[result.status];
	const statusSymbol = STATUS_SYMBOLS[result.status];
	const duration = `${result.duration}ms`;

	let output = `\n${statusColor(statusSymbol)} ${COLORS.bold(result.name)} ${COLORS.dim(`(${duration})`)}\n`;

	if (result.summary) {
		output += `  ${COLORS.muted(result.summary)}\n`;
	}

	if (result.issues.length > 0) {
		output += formatIssues(result.issues);
	}

	return output;
};

export const formatIssues = (issues: CheckIssue[]): string => {
	let output = "";

	for (const issue of issues) {
		const severityColor = SEVERITY_COLORS[issue.severity];
		const severitySymbol = SEVERITY_SYMBOLS[issue.severity];

		output += `  ${severityColor(severitySymbol)} ${issue.message}\n`;

		if (issue.file) {
			const location = issue.line
				? `${issue.file}:${issue.line}${issue.column ? `:${issue.column}` : ""}`
				: issue.file;
			output += `    ${COLORS.dim(location)}\n`;
		}

		if (issue.code) {
			output += `    ${COLORS.dim(`Code: ${issue.code}`)}\n`;
		}

		if (issue.suggestion) {
			output += `    ${COLORS.info(`💡 ${issue.suggestion}`)}\n`;
		}
	}

	return output;
};

export const formatSummary = (results: CheckResults): string => {
	const totalDuration = `${results.duration}ms`;

	let output = `\n${COLORS.bold("Summary")}\n`;
	output += `${COLORS.dim("─".repeat(50))}\n`;

	output += `  ${COLORS.success(STATUS_SYMBOLS.passed)} Passed: ${COLORS.bold(String(results.passed))}\n`;
	output += `  ${COLORS.error(STATUS_SYMBOLS.failed)} Failed: ${COLORS.bold(String(results.failed))}\n`;
	output += `  ${COLORS.muted(STATUS_SYMBOLS.skipped)} Skipped: ${COLORS.bold(String(results.skipped))}\n`;
	output += `  ${COLORS.dim("Total:")} ${COLORS.bold(String(results.total))}\n`;
	output += `  ${COLORS.dim("Duration:")} ${COLORS.bold(totalDuration)}\n`;

	const status = results.failed > 0 ? "FAILED" : "PASSED";
	const statusColor = results.failed > 0 ? COLORS.error : COLORS.success;

	output += `\n${statusColor(COLORS.bold(status))}\n`;

	return output;
};

export const formatTable = (results: CheckResults): string => {
	const rows = results.results.map((r) => [
		STATUS_SYMBOLS[r.status],
		r.name,
		String(r.issues.length),
		`${r.duration}ms`,
	]);

	const headers = ["", "Check", "Issues", "Duration"];
	const colWidths = [3, 20, 10, 12];

	let output = "\n";
	output += formatTableRow(headers, colWidths, true);
	output += `${COLORS.dim("─".repeat(colWidths.reduce((a, b) => a + b, 0) + headers.length + 1))}\n`;

	for (const row of rows) {
		output += formatTableRow(row, colWidths);
	}

	return output;
};

const formatTableRow = (
	row: string[],
	widths: number[],
	isHeader = false,
): string => {
	const formatted = row.map((cell, i) => cell.padEnd(widths[i] || 0)).join(" ");
	return isHeader ? `${COLORS.bold(formatted)}\n` : `${formatted}\n`;
};

export const formatJson = (results: CheckResults): string => {
	return JSON.stringify(results, null, 2);
};
