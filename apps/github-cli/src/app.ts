import { Command } from "commander";
import { runBenchServices } from "./commands/bench-services";
import { runConfigCommand } from "./commands/config";
import { runSync } from "./commands/sync";

const program = new Command();

program.name("github-sync").description("GitHub Sync CLI");

// Global flags for output mode
program
	.option("--output <mode>", "Output format: text, json, table, md")
	.option("--quiet", "Suppress non-error output");

program
	.command("sync")
	.description("Run interactive GitHub file sync")
	.action(async () => {
		try {
			await runSync();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(message);
			process.exitCode = 1;
		}
	});

program
	.command("bench-services")
	.description("Benchmark services commands")
	.action(async () => {
		try {
			await runBenchServices();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(message);
			process.exitCode = 1;
		}
	});

program
	.command("config")
	.description("Manage configuration")
	.option("--get <key>", "Get a configuration value")
	.option("--set <key>", "Set a configuration value")
	.option("--value <value>", "Value to set (use with --set)")
	.option("--scope <scope>", "Config scope: repo or global", "repo")
	.action(async (options) => {
		try {
			await runConfigCommand(options);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(message);
			process.exitCode = 1;
		}
	});

program.action(async () => {
	try {
		await runSync();
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(message);
		process.exitCode = 1;
	}
});

program.parse(process.argv);
