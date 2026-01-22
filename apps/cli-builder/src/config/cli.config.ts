import { Console, Effect } from "effect";
import { runBench } from "../services/bench.service";
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
			action: (args: Record<string, any>) => {
				Effect.runPromise(Console.log(`Hello, ${args.name}!`)).catch(console.error);
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
							action: (args: { name: string; url: string }) => {
								Effect.runPromise(Console.log(`Adding remote ${args.name} with url ${args.url}`)).catch(console.error);
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
			action: (args: Record<string, any>) => Effect.runPromise(runBench(args)),
		},
	],
};
