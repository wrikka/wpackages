import { runAbBenchmark, runBenchmark } from "../app";
import { createBenchmarkConfig } from "../config";
import { ConsoleService } from "../services";
import { getCompletionScript } from "../services/completion.service";
import { loadConfig } from "../services/config-loader";
import { PluginManager } from "../services/plugin.service";
import { checkRegression } from "../services/regression-checker";
import { parseCliArgs } from "../utils/cli-parser";

const printHelp = async (): Promise<void> => {
	await ConsoleService.log(
		[
			"wbench",
			"",
			"Commands:",
			"  run [options] <command...>",
			"  compare <current.json> <base.json> [--threshold <number>]",
			"  completion <bash|zsh|fish>",
			"",
			"Run options:",
			"  --warmup, -w <number>",
			"  --runs, -r <number>",
			"  --concurrency, -j <number>",
			"  --prepare, -p <command>",
			"  --cleanup, -c <command>",
			"  --shell, -s <bash|pwsh>",
			"  --output, -o <text|table|chart|json|histogram|boxplot|csv|md|markdown>",
			"  --export, -e <file.(json|csv|md)>",
			"  --html-report <file.html>",
			"  --config <path>",
			"  --ab",
			"  --verbose, -v",
			"  --silent",
			"",
		].join("\n"),
	);
};

const die = async (message: string, code = 1): Promise<never> => {
	await ConsoleService.error(message);
	process.exit(code);
};

const main = async (): Promise<void> => {
	const argv = process.argv.slice(2);
	const sub = argv[0];

	if (!sub || sub === "--help" || sub === "-h") {
		await printHelp();
		return;
	}

	if (sub === "completion") {
		const shell = argv[1];
		if (!shell) {
			await die("Missing shell. Expected: bash | zsh | fish");
			return;
		}
		await ConsoleService.log(getCompletionScript(shell));
		return;
	}

	if (sub === "compare") {
		const currentPath = argv[1];
		const basePath = argv[2];

		if (!currentPath || !basePath) {
			await die("Usage: wbench compare <current.json> <base.json> [--threshold <number>]");
			return;
		}

		let threshold = 5;
		const thresholdIndex = argv.indexOf("--threshold");
		if (thresholdIndex !== -1) {
			const next = argv[thresholdIndex + 1];
			if (next) threshold = Number.parseFloat(next);
		}

		const regressions = await checkRegression(currentPath, basePath, threshold);
		await ConsoleService.table(regressions);

		if (regressions.some(r => r.isRegression)) {
			process.exit(1);
		}
		return;
	}

	if (sub === "run") {
		const { options: cliOptions, commands: cliCommands } = parseCliArgs(argv.slice(1));
		const configFile = await loadConfig(cliOptions.config);

		const pluginManager = new PluginManager();
		const pluginPaths = configFile.plugins ?? [];
		await pluginManager.loadPlugins(pluginPaths);

		const commands = cliCommands.length > 0 ? cliCommands : (configFile.commands ?? []);
		if (commands.length === 0) {
			await die("No commands provided. Pass commands after options or define them in bench.json.");
			return;
		}

		const options = createBenchmarkConfig(cliOptions, configFile);
		await pluginManager.runHook("onBenchmarkStart", commands, options);

		if (options.ab) {
			if (commands.length !== 2) {
				await die("--ab requires exactly 2 commands.");
				return;
			}
			await runAbBenchmark([commands[0]!, commands[1]!], options, pluginManager);
			return;
		}

		await runBenchmark(commands, options, pluginManager);
		return;
	}

	await printHelp();
	process.exit(1);
};

await main();
