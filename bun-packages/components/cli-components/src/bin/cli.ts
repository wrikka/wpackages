#!/usr/bin/env node
import { runBenchmark } from "../app";
import { parseCliArgs } from "../utils/cli-parser";

// Parse CLI arguments
const args = process.argv.slice(2);

// Handle help flag
if (args.includes("--help") || args.includes("-h")) {
	printHelp();
	process.exit(0);
}

const { options, commands } = parseCliArgs(args);

if (commands.length === 0) {
	console.error("Error: No commands specified");
	printHelp();
	process.exit(1);
}

// Run benchmark
runBenchmark(commands, options)
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		if (!options.silent && error instanceof Error) {
			console.error(`Error: ${error.message}`);
		}
		process.exit(1);
	});

function printHelp() {
	console.log(`
wts-bench - Modern Benchmarking Tool

Usage:
  wbench [options] <command1> [command2] ...

Options:
  -w, --warmup <n>      Number of warmup runs (default: 3)
  -r, --runs <n>        Number of benchmark runs (default: 10)
  -p, --prepare <cmd>   Command to run before each benchmark
  -c, --cleanup <cmd>   Command to run after each benchmark
  -s, --shell <shell>   Shell to use (default: bash/pwsh)
  -o, --output <format> Output format (text, table, chart, json)
  -e, --export <file>   Export results to JSON file
  -v, --verbose         Verbose output
  --silent              Silent mode (no output)
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
