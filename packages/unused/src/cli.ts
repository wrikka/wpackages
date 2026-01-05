#!/usr/bin/env node

import { loadConfig } from "@wpackages/config-manager";
import { Command } from "commander";
import { applyBaseline, loadBaseline, writeBaseline } from "./baseline";
import { defaultUnusedConfig, type UnusedConfig } from "./config";
import { findUnused, findUnusedWorkspace } from "./index";
import { report } from "./reporter";

const program = new Command();

program
	.version("0.1.0")
	.description("A tool to find unused files, dependencies, and exports in your project.")
	.option("-c, --cwd <path>", "The current working directory", process.cwd())
	.option("-e, --entry <files...>", "Entry points to consider as used")
	.option("-i, --ignore <patterns...>", "Glob patterns to ignore")
	.option("-w, --workspace", "Analyze all workspace packages (monorepo mode)")
	.option("-f, --format <format>", "Output format: text|json|sarif", "text")
	.option("-o, --output <file>", "Write output to a file instead of stdout")
	.option("-b, --baseline <file>", "Baseline JSON file to suppress known issues")
	.option("--update-baseline", "Update baseline file from current results")
	.option("--cache", "Enable disk cache (default)", true)
	.option("--no-cache", "Disable disk cache")
	.option("--cache-file <file>", "Cache file path (default: .unused-cache.json)")
	.option("--ignore-unused-files <patterns...>", "Ignore unused file results by glob pattern")
	.option("--ignore-exports <names...>", "Ignore unused export results by export name (supports *)")
	.option("--ignore-deps <names...>", "Ignore unused dependency results by package name")
	.action(async (options) => {
		try {
			const { config: loadedConfig } = await loadConfig<UnusedConfig>({
				name: "unused",
				cwd: options.cwd,
				defaultConfig: defaultUnusedConfig,
			});

			const resolvedOptions: UnusedConfig = {
				...loadedConfig,
				cwd: options.cwd,
				entrypoints: options.entry ?? loadedConfig.entrypoints,
				ignore: options.ignore ?? loadedConfig.ignore,
				ignoreUnusedFiles: options.ignoreUnusedFiles ?? loadedConfig.ignoreUnusedFiles,
				ignoreExports: options.ignoreExports ?? loadedConfig.ignoreExports,
				ignoreDependencies: options.ignoreDeps ?? loadedConfig.ignoreDependencies,
				baseline: options.baseline ?? loadedConfig.baseline,
				updateBaseline: Boolean(options.updateBaseline) || Boolean(loadedConfig.updateBaseline),
				cache: typeof options.cache === "boolean" ? options.cache : loadedConfig.cache,
				cacheFile: options.cacheFile ?? loadedConfig.cacheFile,
			};

			const isWorkspace = Boolean(options.workspace) || Boolean(loadedConfig.workspace);
			const rawResult = isWorkspace
				? await findUnusedWorkspace(resolvedOptions)
				: await findUnused(resolvedOptions);

			let result = rawResult;
			if (resolvedOptions.baseline) {
				const baseline = await loadBaseline(resolvedOptions.baseline);
				if (baseline) {
					result = applyBaseline(result, baseline, resolvedOptions.cwd) as typeof result;
				}
			}

			if (resolvedOptions.updateBaseline) {
				const baselinePath = resolvedOptions.baseline ?? "unused.baseline.json";
				await writeBaseline(baselinePath, rawResult, resolvedOptions.cwd);
			}

			const exitCode = await report(result, {
				cwd: options.cwd,
				format: options.format,
				outputFile: options.output,
			});
			process.exit(exitCode);
		} catch (error) {
			console.error("An unexpected error occurred:", error);
			process.exit(2);
		}
	});

program.parse(process.argv);
