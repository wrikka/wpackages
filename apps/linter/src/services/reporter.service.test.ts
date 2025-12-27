/**
 * Tests for reporter service
 */

import { describe, expect, it } from "vitest";
import type { LintReport, LintResult } from "../types";

describe("ReporterService", () => {
	const createMockResult = (
		filePath: string,
		errorCount: number,
		warningCount: number,
	): LintResult => ({
		filePath,
		messages: [],
		errorCount,
		warningCount,
		fixableErrorCount: 0,
		fixableWarningCount: 0,
	});

	it("should create report with correct counts", () => {
		const results: LintResult[] = [
			createMockResult("file1.ts", 2, 1),
			createMockResult("file2.ts", 0, 3),
		];

		const report: LintReport = {
			results,
			errorCount: 2,
			warningCount: 4,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
			filesLinted: 2,
		};

		expect(report.errorCount).toBe(2);
		expect(report.warningCount).toBe(4);
		expect(report.filesLinted).toBe(2);
	});

	it("should handle empty results", () => {
		const report: LintReport = {
			results: [],
			errorCount: 0,
			warningCount: 0,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
			filesLinted: 0,
		};

		expect(report.results).toHaveLength(0);
		expect(report.errorCount).toBe(0);
		expect(report.filesLinted).toBe(0);
	});

	it("should count fixable issues", () => {
		const report: LintReport = {
			results: [],
			errorCount: 5,
			warningCount: 3,
			fixableErrorCount: 2,
			fixableWarningCount: 1,
			filesLinted: 1,
		};

		expect(report.fixableErrorCount).toBe(2);
		expect(report.fixableWarningCount).toBe(1);
	});
});
