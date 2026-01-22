import { executeBenchmark } from "./components/benchmark-executor";
import {
	formatBenchmarkResult,
	formatChart,
	formatComparison,
	formatCsv,
	formatJson,
	formatMarkdown,
	formatTable,
} from "./components/index";
import { createBenchmarkConfig } from "./config/index";
import { calculateStats, compareResults } from "./lib/benchmark";
import { type CommandInput, formatCommandInput, runCommandInput, type RunResult } from "./lib/runner";
import { ConsoleService } from "./services/index";
import type { PluginManager } from "./services/plugin.service";
import { generateReport } from "./services/report";
import type { BenchmarkOptions, BenchmarkResult, ComparisonResult } from "./types/index";

const handleOutput = async (
	result: BenchmarkResult | ComparisonResult,
	options: BenchmarkOptions,
): Promise<void> => {
	if (options.silent) return;

	if ("fastest" in result) {
		switch (options.output) {
			case "json":
				await ConsoleService.log(formatJson(result));
				break;
			case "table":
				await ConsoleService.log(formatTable(result));
				break;
			case "chart":
				await ConsoleService.log(formatChart(result));
				break;
			case "csv":
				await ConsoleService.log(formatCsv(result));
				break;
			case "md":
			case "markdown":
				await ConsoleService.log(formatMarkdown(result));
				break;
			default:
				await ConsoleService.log(formatComparison(result));
		}
	} else {
		await ConsoleService.log(formatBenchmarkResult(result));
	}

	if (options.export) {
		let outputContent = "";
		const filePath = options.export;

		if (!("fastest" in result)) {
			// For single benchmark results, always export as JSON.
			outputContent = JSON.stringify(result, null, 2);
		} else {
			// For comparison results, format based on extension.
			if (filePath.endsWith(".csv")) {
				outputContent = formatCsv(result);
			} else if (filePath.endsWith(".md")) {
				outputContent = formatMarkdown(result);
			} else { // Default to JSON
				outputContent = JSON.stringify(result, null, 2);
			}
		}

		await Bun.write(filePath, outputContent);
		await ConsoleService.success(`\n✓ Results exported to ${filePath}`);
	}

	if (options.htmlReport) {
		await generateReport(result, options.htmlReport);
	}
};

const runSingleBenchmark = async (
	command: string,
	options: BenchmarkOptions,
): Promise<BenchmarkResult> => {
	if (!options.silent) {
		await ConsoleService.log(`🔥 Benchmarking: ${command}\n`);
	}
	const result = await executeBenchmark(command, options);
	await handleOutput(result, options);
	return result;
};

const runComparisonBenchmark = async (
	commands: string[],
	options: BenchmarkOptions,
	pluginManager: PluginManager,
): Promise<ComparisonResult> => {
	if (!options.silent) {
		await ConsoleService.log(`🔥 Benchmarking ${commands.length} commands...\n`);
	}

	const results: BenchmarkResult[] = [];
	for (const command of commands) {
		if (!options.silent) {
			await ConsoleService.log(`\nBenchmarking: ${command}`);
		}
		const result = await executeBenchmark(command, options);
		await pluginManager.runHook("onBenchmarkComplete", result);
		results.push(result);
	}

	const comparison = compareResults(results);
	await pluginManager.runHook("onComparisonComplete", comparison);
	await handleOutput(comparison, options);
	return comparison;
};

export const runBenchmark = async (
	commands: string[],
	partialOptions: Partial<BenchmarkOptions> = {},
	pluginManager: PluginManager,
): Promise<BenchmarkResult | ComparisonResult> => {
	const options = createBenchmarkConfig(partialOptions);
	try {
		if (commands.length === 1) {
			return await runSingleBenchmark(commands[0]!, options);
		} else {
			return await runComparisonBenchmark(commands, options, pluginManager);
		}
	} catch (error) {
		throw error instanceof Error ? error : new Error("Benchmark failed");
	}
};

export const runAbBenchmark = async (
	commands: [CommandInput, CommandInput],
	partialOptions: Partial<BenchmarkOptions> = {},
	pluginManager: PluginManager,
): Promise<ComparisonResult> => {
	const options = createBenchmarkConfig(partialOptions);
	const [commandA, commandB] = commands;
	const commandALabel = formatCommandInput(commandA);
	const commandBLabel = formatCommandInput(commandB);

	if (!options.silent) {
		await ConsoleService.log(`🔥 A/B Benchmarking:`);
		await ConsoleService.log(`  A: ${commandALabel}`);
		await ConsoleService.log(`  B: ${commandBLabel}\n`);
	}

	if (options.warmup && options.warmup > 0) {
		if (!options.silent) {
			await ConsoleService.log(`Running ${options.warmup} warmup iterations (interleaved)...`);
		}
		for (let i = 0; i < options.warmup; i++) {
			await runCommandInput(commandA, options.shell ?? "bash");
			await runCommandInput(commandB, options.shell ?? "bash");
		}
	}

	const resultsA: RunResult[] = [];
	const resultsB: RunResult[] = [];
	let errorCountA = 0;
	let errorCountB = 0;
	const totalRuns = options.runs ?? 10;

	for (let i = 0; i < totalRuns; i++) {
		try {
			resultsA.push(await runCommandInput(commandA, options.shell ?? "bash"));
		} catch {
			errorCountA++;
		}
		try {
			resultsB.push(await runCommandInput(commandB, options.shell ?? "bash"));
		} catch {
			errorCountB++;
		}
	}

	const createFinalResult = (command: string, results: RunResult[], errorCount: number): BenchmarkResult => {
		const times = results.map(r => r.timeMs);
		const stats = calculateStats(command, times, errorCount, totalRuns, {
			cpuUserMicros: results.reduce((s, r) => s + r.cpuUserMs, 0) * 1000,
			cpuSystemMicros: results.reduce((s, r) => s + r.cpuSystemMs, 0) * 1000,
			maxRssBytes: Math.max(0, ...results.map(r => r.maxRssBytes)),
			fsReadBytes: results.reduce((s, r) => s + r.fsReadBytes, 0),
			fsWriteBytes: results.reduce((s, r) => s + r.fsWriteBytes, 0),
		});
		return stats;
	};

	const finalResultA = createFinalResult(commandALabel, resultsA, errorCountA);
	const finalResultB = createFinalResult(commandBLabel, resultsB, errorCountB);

	const comparison = compareResults([finalResultA, finalResultB]);
	await pluginManager.runHook("onComparisonComplete", comparison);

	await handleOutput(comparison, options);

	return comparison;
};
