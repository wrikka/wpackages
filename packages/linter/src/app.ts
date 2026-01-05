/**
 * Main application layer for code-quality
 *
 * Composes all services and components to provide the linting functionality
 */

import { Effect } from "effect";
import { ConfigLoader, ConfigLoaderLive } from "./core/config-loader";
import { report } from "./core/reporter";
import { findFilesInMultipleDirs } from "./services/file-finder.service";
import type { FileSystemError, LinterOptions, LintReport, SemanticLinterError } from "./types";

export type LintOptions = {
	readonly paths: readonly string[];
	readonly fix?: boolean;
	readonly silent?: boolean;
	readonly configFile?: string;
};

export const lint = (
	options: LintOptions,
): Effect.Effect<LintReport, FileSystemError | SemanticLinterError | Error> =>
	Effect.gen(function*(_) {
		const { fix = false, silent = false, paths, configFile } = options;

		const configLoader = yield* _(ConfigLoader);
		const config = yield* _(configLoader.load(configFile));

		const files = yield* _(findFilesInMultipleDirs(paths, [])); // Ignoring is now handled by plugins/config

		if (!silent) {
			yield* _(Effect.log(`🔍 Found ${files.length} file(s) to lint using ${config.plugins.length} plugin(s)...`));
		}

		if (files.length === 0) {
			return { errorCount: 0, warningCount: 0, results: [], fixableErrorCount: 0, fixableWarningCount: 0, filesLinted: 0 };
		}

		const linterOptions: LinterOptions = { fix, rules: {}, ignore: [], extensions: [] }; // Options are now passed to plugins

		const pluginReports = yield* _(
			Effect.all(
				config.plugins.map(plugin => plugin.lint(files, linterOptions, config)),
				{ concurrency: "inherit" }
			)
		);

		const finalReport = yield* _(report(pluginReports));

		if (!silent) {
			yield* _(Effect.log(`✅ Linting complete: ${finalReport.errorCount} errors, ${finalReport.warningCount} warnings`));
		}

		return finalReport;
	}).pipe(Effect.provide(ConfigLoaderLive));
