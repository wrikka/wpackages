import * as p from "@clack/prompts";
import type { BenchmarkOptions } from "bench";
import { runBenchmark } from "bench";

type OutputFormat = NonNullable<BenchmarkOptions["output"]>;

const defaultShell = process.platform === "win32" ? "pwsh" : "bash";

const parsePositiveInt = (input: string, fallback: number): number => {
	const n = Number.parseInt(input, 10);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseNonNegativeInt = (input: string, fallback: number): number => {
	const n = Number.parseInt(input, 10);
	return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const runBenchServices = async (): Promise<void> => {
	const mode = await p.select<"single" | "compare">({
		message: "Benchmark mode:",
		options: [
			{ value: "single", label: "Single command" },
			{ value: "compare", label: "Compare multiple commands" },
		],
	});

	if (p.isCancel(mode)) return;

	const command1 = await p.text({
		message: "Command 1:",
		placeholder: "bun --version",
		initialValue: "bun --version",
	});
	if (p.isCancel(command1)) return;

	const commands: string[] = [String(command1).trim()].filter(Boolean);

	if (mode === "compare") {
		const command2 = await p.text({
			message: "Command 2:",
			placeholder: "node --version",
			initialValue: "node --version",
		});
		if (p.isCancel(command2)) return;
		const c2 = String(command2).trim();
		if (c2) commands.push(c2);
	}

	const runsInput = await p.text({
		message: "Runs (default 10):",
		placeholder: "10",
		initialValue: "10",
	});
	if (p.isCancel(runsInput)) return;

	const warmupInput = await p.text({
		message: "Warmup runs (default 3):",
		placeholder: "3",
		initialValue: "3",
	});
	if (p.isCancel(warmupInput)) return;

	const concurrencyInput = await p.text({
		message: "Concurrency (default 1):",
		placeholder: "1",
		initialValue: "1",
	});
	if (p.isCancel(concurrencyInput)) return;

	const output = await p.select<OutputFormat>({
		message: "Output format:",
		options: [
			{ value: "text", label: "text" },
			{ value: "table", label: "table" },
			{ value: "chart", label: "chart" },
			{ value: "json", label: "json" },
		],
	});
	if (p.isCancel(output)) return;

	const exportPath = await p.text({
		message: "Export to file (optional):",
		placeholder: "results.json",
		initialValue: "",
	});
	if (p.isCancel(exportPath)) return;

	const options: Partial<BenchmarkOptions> = {
		runs: parsePositiveInt(String(runsInput), 10),
		warmup: parseNonNegativeInt(String(warmupInput), 3),
		concurrency: parsePositiveInt(String(concurrencyInput), 1),
		shell: defaultShell,
		output,
	};

	const maybeExport = String(exportPath).trim();
	if (maybeExport) {
		options.export = maybeExport;
	}

	await runBenchmark(commands, options);
};
