/**
 * Reporter service - Format and display lint results
 */

import type { LintReport, LintResult } from "../types";

export const formatMessage = (result: LintResult): string => {
	return `File: ${result.filePath} - ${result.errorCount} errors, ${result.warningCount} warnings`;
};

export const formatReport = (report: LintReport): string => {
	return `Total: ${report.errorCount} errors, ${report.warningCount} warnings in ${report.filesLinted} files`;
};

export const reportToConsole = (report: LintReport): void => {
	console.log(formatReport(report));
};
