#!/usr/bin/env node

import { runBenchmark } from "bench";
import type { BenchmarkOptions } from "bench";
import pc from "picocolors";
import { lint } from "./app";

const helpText = `
${pc.bold(pc.cyan("lint"))} - Advanced TypeScript/JavaScript Linter

${pc.bold("Usage:")}
  wlint [paths...] [options]
  wlint bench [options] [paths...]

${pc.bold("Options:")}
  --fix              Apply auto-fixes where possible
  --silent           Suppress output (exit code only)
  --help, -h         Show this help message

${pc.bold("Bench Options:")}
  --runs, -r <n>        Number of benchmark runs (default: 10)
  --warmup, -w <n>      Number of warmup runs (default: 3)
  --concurrency, -j <n> Parallel processes per iteration (default: 1)
  --shell, -s <shell>   Shell to use (default: pwsh on win32, bash otherwise)
  --output, -o <fmt>    Output format (text, table, chart, json)
  --export, -e <file>   Export results to JSON file
  --verbose, -v         Verbose output
  --only-oxlint         Benchmark only oxlint
  --only-biome          Benchmark only biome
`;

type BenchSelection =
	| { readonly kind: "both" }
	| { readonly kind: "oxlint" }
	| { readonly kind: "biome" };

const defaultShell = process.platform === "win32" ? "pwsh" : "bash";

const quoteArg = (arg: string): string => JSON.stringify(arg);

const parseBenchArgs = (
	args: readonly string[],
): {
	readonly options: Partial<BenchmarkOptions>;
	readonly selection: BenchSelection;
	readonly paths: readonly string[];
} => {
	const options: Partial<BenchmarkOptions> = {};
	let selection: BenchSelection = { kind: "both" };
	const paths: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (!arg) continue;

		switch (arg) {
			case "--warmup":
			case "-w": {
				const next = args[i + 1];
				if (next) {
					i++;
					options.warmup = Number.parseInt(next, 10);
				}
				break;
			}
			case "--runs":
			case "-r": {
				const next = args[i + 1];
				if (next) {
					i++;
					options.runs = Number.parseInt(next, 10);
				}
				break;
			}
			case "--concurrency":
			case "-j": {
				const next = args[i + 1];
				if (next) {
					i++;
					options.concurrency = Number.parseInt(next, 10);
				}
				break;
			}
			case "--shell":
			case "-s": {
				const next = args[i + 1];
				if (next) {
					i++;
					options.shell = next;
				}
				break;
			}
			case "--output":
			case "-o": {
				const next = args[i + 1];
				if (next) {
					i++;
					if (
						next === "json"
						|| next === "text"
						|| next === "table"
						|| next === "chart"
					) {
						options.output = next;
					}
				}
				break;
			}
			case "--export":
			case "-e": {
				const next = args[i + 1];
				if (next) {
					i++;
					options.export = next;
				}
				break;
			}
			case "--verbose":
			case "-v":
				options.verbose = true;
				break;
			case "--silent":
				options.silent = true;
				break;
			case "--only-oxlint":
				selection = { kind: "oxlint" };
				break;
			case "--only-biome":
				selection = { kind: "biome" };
				break;
			default:
				if (!arg.startsWith("-")) {
					paths.push(arg);
				}
		}
	}

	if (!options.shell) {
		options.shell = defaultShell;
	}

	return { options, selection, paths };
};

const main = async () => {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		console.log(helpText);
		return;
	}

	if (args[0] === "bench") {
		const { options, selection, paths } = parseBenchArgs(args.slice(1));
		const targetPaths = paths.length > 0 ? paths : ["."];
		const oxlintCmd = `bunx oxlint ${targetPaths.map(quoteArg).join(" ")}`;
		const biomeCmd = `bunx biome lint ${targetPaths.map(quoteArg).join(" ")}`;

		const commands = selection.kind === "oxlint"
			? [oxlintCmd]
			: selection.kind === "biome"
			? [biomeCmd]
			: [oxlintCmd, biomeCmd];

		try {
			await runBenchmark(commands, options);
			process.exit(0);
		} catch (error) {
			if (!options.silent) {
				const message = error instanceof Error ? error.message : String(error);
				console.error(pc.red("Bench failed:"), message);
			}
			process.exit(1);
		}
	} else {
		const paths = args.filter((arg) => !arg.startsWith("--"));
		if (paths.length === 0) {
			console.error(pc.red("Error: No paths specified"));
			process.exit(1);
		}

		const result = await lint({
			paths,
			fix: args.includes("--fix"),
			silent: args.includes("--silent"),
		});

		if (result.isErr()) {
			console.error(pc.red("Fatal error:"), result.unwrapErr());
			process.exit(2);
		}

		const report = result.unwrap();
		if (report.errorCount > 0) {
			process.exit(1);
		}
	}
};

main().catch((error) => {
	console.error(pc.red("Fatal error:"), error);
	process.exit(2);
});
