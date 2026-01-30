import { Console, Effect } from "effect";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface BenchArgs {
	commands: string;
	export?: string;
	runs?: number;
	warmup?: number;
	output?: string;
	open?: boolean;
}

export const runBench = (args: BenchArgs) =>
	Effect.tryPromise(async () => {
		const here = dirname(fileURLToPath(import.meta.url));
		// FIXME: This path is hardcoded, should be resolved dynamically
		const benchDir = resolve(here, "../../../packages/bench");
		const exportPath = resolve(process.cwd(), String(args.export ?? "results.json"));

		const commands = String(args.commands ?? "").split(",").map(s => s.trim()).filter(Boolean);

		if (commands.length === 0) {
			return Effect.runPromise(Console.error("No commands provided. Use --commands \"cmd1,cmd2\""));
		}

		const proc = Bun.spawn(
			[
				"bun",
				"run",
				"src/bin/cli.ts",
				"--runs",
				String(args.runs ?? 10),
				"--warmup",
				String(args.warmup ?? 3),
				"--output",
				String(args.output ?? "text"),
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
	});
