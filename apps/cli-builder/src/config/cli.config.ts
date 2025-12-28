import { Console, Effect } from "effect";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { CliConfig } from "../types";

export const config: CliConfig = {
	name: "my-cli",
	version: "0.0.1",
	before: () => Effect.runPromise(Console.log("Running Global Before Hook...")),
	after: () => Effect.runPromise(Console.log("Running Global After Hook...")),
	commands: [
		{
			name: "hello",
			description: "Prints a greeting",
			options: [
				{
					name: "--name",
					shorthand: "-n",
					description: "The name to greet",
					defaultValue: "World",
				},
			],
			action: args => {
				Effect.runPromise(Console.log(`Hello, ${args.name}!`));
			},
			before: () => Effect.runPromise(Console.log("Running Command-Specific Before Hook for hello...")),
			after: () => Effect.runPromise(Console.log("Running Command-Specific After Hook for hello...")),
		},
		{
			name: "git",
			description: "A git-like command",
			subCommands: [
				{
					name: "remote",
					description: "Manage remotes",
					subCommands: [
						{
							name: "add",
							description: "Add a new remote",
							options: [
								{ name: "--name", required: true },
								{ name: "--url", required: true },
							],
							action: args => {
								Effect.runPromise(Console.log(`Adding remote ${args.name} with url ${args.url}`));
							},
						},
					],
				},
			],
		},
		{
			name: "bench",
			description: "Run benchmarks via packages/bench and export JSON for the web viewer",
			options: [
				{
					name: "--commands",
					shorthand: "-c",
					description: "Comma-separated commands to benchmark (wrap each in quotes if needed)",
					required: true,
				},
				{
					name: "--export",
					shorthand: "-e",
					description: "Export results to JSON file path",
					defaultValue: "results.json",
				},
				{
					name: "--runs",
					shorthand: "-r",
					description: "Number of benchmark runs",
					defaultValue: 10,
				},
				{
					name: "--warmup",
					shorthand: "-w",
					description: "Number of warmup runs",
					defaultValue: 3,
				},
				{
					name: "--output",
					shorthand: "-o",
					description: "Output format (text, table, chart, json)",
					defaultValue: "text",
				},
				{
					name: "--open",
					description: "Print viewer URL hint (/bench)",
					defaultValue: false,
				},
			],
			action: async (args) => {
				const here = dirname(fileURLToPath(import.meta.url));
				const benchDir = resolve(here, "../../../packages/bench");
				const exportPath = resolve(process.cwd(), String(args.export ?? "results.json"));
				const runs = String(args.runs ?? 10);
				const warmup = String(args.warmup ?? 3);
				const output = String(args.output ?? "text");

				const rawCommands = String(args.commands ?? "");
				const commands = rawCommands
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);

				if (commands.length === 0) {
					await Effect.runPromise(Console.error("No commands provided. Use --commands\"cmd1,cmd2\""));
					return;
				}

				const proc = Bun.spawn(
					[
						"bun",
						"run",
						"src/bin/cli.ts",
						"--runs",
						runs,
						"--warmup",
						warmup,
						"--output",
						output,
						"--export",
						exportPath,
						...commands,
					],
					{
						cwd: benchDir,
						stdout: "inherit",
						stderr: "inherit",
					},
				);

				const exitCode = await proc.exited;
				if (exitCode !== 0) {
					throw new Error(`bench failed with exit code ${exitCode}`);
				}

				await Effect.runPromise(Console.log(`Exported: ${exportPath}`));
				if (args.open) {
					await Effect.runPromise(Console.log("Viewer: open apps/webcontainer/examples then go to /bench"));
				}
			},
		},
	],
};
