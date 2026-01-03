/**
 * Main application layer for code-quality
 *
 * Composes all services and components to provide the linting functionality
 */

import { DEFAULT_CONFIG } from "./config";
import { ALL_RULES } from "./rules";
import { lintFiles } from "./services/linter.service";
import type { LinterOptions, LintReport } from "./types";
import { Result } from "./utils";

/**
 * Lint configuration options
 */
export type LintOptions = {
	readonly paths: readonly string[];
	readonly rules?: Record<string, "off" | "warning" | "error">;
	readonly fix?: boolean;
	readonly silent?: boolean;
	readonly ignore?: readonly string[];
};

/**
 * Main lint function - Orchestrates the linting process
 *
 * @param options - Linting options
 * @returns Promise with lint report or error
 */
export async function lint(
	options: LintOptions,
): Promise<Result.Result<LintReport, Error>> {
	try {
		const {
			rules: customRules,
			fix = false,
			silent = false,
			ignore = DEFAULT_CONFIG.ignore,
		} = options;

		// Merge custom rules with defaults
		const mergedRules = {
			...DEFAULT_CONFIG.rules,
			...customRules,
		};

		// Create linter options
		const linterOptions: LinterOptions = {
			rules: mergedRules,
			fix,
			ignore,
			extensions: DEFAULT_CONFIG.extensions,
		};

		// Find files to lint
		// Note: In a real implementation, would use findFilesInMultipleDirs with Effect.runPromise
		// For now, return empty array as placeholder
		const files: readonly string[] = [];

		if (!silent) {
			console.log(`🔍 Found ${files.length} file(s) to lint`);
		}

		if (files.length === 0) {
			const emptyReport: LintReport = {
				results: [],
				errorCount: 0,
				warningCount: 0,
				fixableErrorCount: 0,
				fixableWarningCount: 0,
				filesLinted: 0,
			};
			return Result.ok(emptyReport);
		}

		// Run linter
		const report = await lintFiles(files, ALL_RULES, linterOptions);

		if (!silent) {
			console.log(
				`✅ Linting complete: ${report.errorCount} errors, ${report.warningCount} warnings`,
			);
		}

		return Result.ok(report);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return Result.err<LintReport, Error>(
			new Error(`Linting failed: ${message}`),
		);
	}
}

/**
 * Lint with default configuration
 *
 * @param paths - Paths to lint
 * @returns Promise with lint report or error
 */
export async function lintWithDefaults(
	paths: readonly string[],
): Promise<Result.Result<LintReport, Error>> {
	return lint({ paths });
}

/**
 * Main entry point for CLI
 */
export async function run() {
	console.log("format - Coming soon!");
}
