import { Effect } from "effect";
import pc from "picocolors";
import type { LintReport } from "../types";
import type { PluginLintReport } from "../types/plugins";

export function report(reports: readonly PluginLintReport[]): Effect.Effect<LintReport> {
	return Effect.sync(() => {
		let errorCount = 0;
		let warningCount = 0;

		for (const report of reports) {
			if (report.issues.length > 0) {
				console.log(`\n${pc.underline(report.linterName)} results:`);
			}
			for (const issue of report.issues) {
				const location = `${issue.filePath}:${issue.line}:${issue.column}`;
				const severity = issue.severity === "error" ? pc.red("error") : pc.yellow("warning");
				console.log(`  ${pc.gray(location)} ${severity} ${issue.message} ${pc.dim(`(${issue.ruleName})`)}`);
				if (issue.severity === "error") errorCount++;
				if (issue.severity === "warning") warningCount++;
			}
		}

		console.log(`\n${pc.bold("Summary:")}`);
		console.log(`  - Total Errors: ${errorCount}`);
		console.log(`  - Total Warnings: ${warningCount}`);

		// This is a simplified report. A more detailed one would be built here.
		return {
			results: [],
			errorCount,
			warningCount,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
			filesLinted: 0, // This would need to be calculated properly
		};
	});
}
