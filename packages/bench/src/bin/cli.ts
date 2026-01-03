#!/usr/bin/env node
import { runAbBenchmark, runBenchmark } from "../app";
import { createBenchmarkConfig } from "../config";
import { ConsoleService } from "../services";
import { getCompletionScript } from "../services/completion.service";
import { loadConfig } from "../services/config-loader";
import { HistoryService } from "../services/history.service";
import { PluginManager } from "../services/plugin.service";
import { checkRegression } from "../services/regression-checker";
import { generateReport } from "../services/report";
import type { BenchmarkOptions } from "../types";
import { parseCliArgs } from "../utils";

const runCmd = async (commands: string[], options: BenchmarkOptions, pluginManager: PluginManager) => {
	let result;
	try {
		await pluginManager.runHook("onBenchmarkStart", commands, options);

		if (options.ab) {
			if (commands.length !== 2) {
				await ConsoleService.error("Error: A/B testing mode requires exactly two commands.");
				process.exit(1);
			}
			result = await runAbBenchmark(commands as [string, string], options, pluginManager);
		} else {
			result = await runBenchmark(commands, options, pluginManager);
		}
	} catch (error) {
		if (error instanceof Error) {
			await pluginManager.runHook("onError", error);
		}
		// Re-throw to be caught by the main catch block
		throw error;
	}

	if (options.htmlReport && result) {
		await generateReport(result, options.htmlReport);
	}
};

const compareCmd = async (args: string[], historyService: HistoryService) => {
	const { options, commands } = parseCliArgs(args);

	if (commands.length !== 2) {
		await ConsoleService.error("Error: The 'compare' command requires exactly two arguments: <current> <baseline>");
		printHelp();
		process.exit(1);
	}

	const [currentName, baseName] = commands;
	const threshold = options.threshold ?? 10; // Default 10% threshold

	try {
		// checkRegression expects file paths. We load the runs and write them to temp files.
		const currentJson = await historyService.loadRun(currentName!);
		const baseJson = await historyService.loadRun(baseName!);

		const tempCurrentPath = `/tmp/bench-current-${Date.now()}.json`;
		const tempBasePath = `/tmp/bench-base-${Date.now()}.json`;

		await Bun.write(tempCurrentPath, JSON.stringify(currentJson));
		await Bun.write(tempBasePath, JSON.stringify(baseJson));

		const results = await checkRegression(tempCurrentPath, tempBasePath, threshold);
		let hasRegression = false;

		console.log(`\nComparing ${currentName} against baseline ${baseName} (Threshold: ${threshold}%)\n`);

		for (const res of results) {
			const sign = res.diffPercentage > 0 ? "+" : "";
			const color = res.isRegression ? "\x1b[31m" : "\x1b[32m"; // red or green
			const resetColor = "\x1b[0m";
			const message = `${res.command}: ${sign}${res.diffPercentage.toFixed(2)}%`;

			if (res.isRegression) {
				hasRegression = true;
				console.log(`${color}✗ Regression detected: ${message}${resetColor}`);
			} else {
				console.log(`${color}✓ No regression: ${message}${resetColor}`);
			}
		}

		if (hasRegression) {
			await ConsoleService.error("\nPerformance regression detected.");
			process.exit(1);
		} else {
			await ConsoleService.success("\nNo performance regressions detected.");
			process.exit(0);
		}
	} catch (error) {
		if (error instanceof Error) {
			await ConsoleService.error(`Error during comparison: ${error.message}`);
		}
		process.exit(1);
	}
};

const completionCmd = async (args: string[]) => {
	const shell = args[0] ?? process.env["SHELL"]?.split("/").pop() ?? "bash";
	const script = getCompletionScript(shell);
	console.log(script);
	process.exit(0);
};

const saveCmd = async (
	args: string[],
	options: BenchmarkOptions,
	pluginManager: PluginManager,
	historyService: HistoryService,
) => {
	const name = args[0];
	if (!name) {
		await ConsoleService.error("Error: 'save' command requires a name.");
		printHelp();
		process.exit(1);
	}
	const commands = args.slice(1);
	if (commands.length === 0) {
		await ConsoleService.error("Error: 'save' command requires at least one command to benchmark.");
		process.exit(1);
	}
	const result = await runBenchmark(commands, options, pluginManager);
	const savedPath = await historyService.saveRun(name, result);
	await ConsoleService.success(`\n✓ Benchmark saved as '${name}' (${savedPath})`);
};

const listCmd = async (historyService: HistoryService) => {
	const runs = await historyService.listRuns();
	if (runs.length === 0) {
		await ConsoleService.info("No saved benchmark runs found.");
		return;
	}
	await ConsoleService.log("\nSaved benchmark runs:");
	for (const run of runs) {
		console.log(`  - ${run}`);
	}
};

const main = async () => {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		printHelp();
		return;
	}

	const { options: cliOptions, commands: cliCommands } = parseCliArgs(args);
	const configFile = await loadConfig(cliOptions.config);

	const pluginManager = new PluginManager();
	if (configFile.plugins) {
		await pluginManager.loadPlugins(configFile.plugins);
	}

	const historyService = new HistoryService();
	const command = args[0];

	if (command === "save") {
		const options = createBenchmarkConfig(cliOptions, configFile);
		await saveCmd(args.slice(1), options, pluginManager, historyService);
	} else if (command === "list") {
		await listCmd(historyService);
	} else if (command === "compare") {
		await compareCmd(args.slice(1), historyService);
	} else if (command === "completion") {
		await completionCmd(args.slice(1));
	} else {
		const options = createBenchmarkConfig(cliOptions, configFile);
		let commands = cliCommands.length > 0 ? cliCommands : configFile.commands ?? [];

		if (options.parameterScan) {
			if (commands.length !== 1) {
				await ConsoleService.error("Error: Parameter scanning requires exactly one command template.");
				process.exit(1);
			}
			const template = commands[0]!;
			const { parameter, values } = options.parameterScan;
			commands = values.map(value => template.replace(`{${parameter}}`, String(value)));
		}

		if (commands.length === 0) {
			await ConsoleService.error("Error: No commands specified in arguments or config file.");
			printHelp();
			process.exit(1);
		}

		await runCmd(commands, options, pluginManager);
	}
};

main().catch((error) => {
	// Error handling is done inside runBenchmark and main, but this catches unhandled rejections.
	// We check for options.silent in runBenchmark, so we don't need to here.
	if (error instanceof Error) {
		void ConsoleService.error(`An unexpected error occurred: ${error.message}`);
	}
	process.exit(1);
});

function printHelp() {
	console.log(`
wts-bench - Modern Benchmarking Tool

Usage:
  wbench [command] [options]

Commands:
  run (default)         Run a new benchmark.
  save <name> <cmd...>  Run benchmark and save result to history.
  list                  List all saved benchmark runs.
  compare <c> <b>       Compare two runs (by name or path).
  completion [shell]    Generate shell completion script (bash, zsh, fish).

Compare Options:
  --threshold <%>     Set the regression threshold (default: 10).

Run Options:

Options:
  -w, --warmup <n>      Number of warmup runs (default: 3)
  -r, --runs <n>        Number of benchmark runs (default: 10)
  -j, --concurrency <n> Parallel processes per iteration (default: 1)
  -p, --prepare <cmd>   Command to run before each benchmark
  -c, --cleanup <cmd>   Command to run after each benchmark
  -s, --shell <shell>   Shell to use (default: bash/pwsh)
  -o, --output <format> Output format (text, table, chart, json)
  -e, --export <file>   Export results to JSON file
  --html-report <path>  Generate an interactive HTML report
  --config <path>       Specify a path to a config file (bench.json)
  --parameter-scan <p:v> Scan a parameter (e.g., "size:10,20,30")
  -v, --verbose         Verbose output
  --silent              Silent mode (no output)
  --ab                  Enable A/B testing mode (requires exactly 2 commands)
  -h, --help            Show this help

Examples:
  # Benchmark a single command
  wbench "sleep 0.1"

  # Compare multiple commands
  wbench "bun run test" "npm run test"

  # With warmup and more runs
  wbench -w 5 -r 20 "node script.js"

  # Export results
  wbench --export results.json "command1" "command2"

  # Different output formats
  wbench --output table "cmd1" "cmd2"
  wbench --output chart "cmd1" "cmd2"
  wbench --output json "cmd1" "cmd2"

Features:
  • Statistical analysis (mean, median, stddev, percentiles)
  • Multiple output formats (text, table, chart, JSON)
  • Warmup runs to reduce cold start bias
  • Prepare/cleanup commands for each run
  • Export results for further analysis
  • Better than hyperfine with more detailed statistics
`);
}
