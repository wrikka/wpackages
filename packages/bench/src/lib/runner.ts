export type RunResult = {
	timeMs: number;
	cpuUserMs: number;
	cpuSystemMs: number;
	maxRssBytes: number;
	fsReadBytes: number;
	fsWriteBytes: number;
};

/**
 * Run a command and measure its execution time and resource usage.
 *
 * @param command - The command to execute.
 * @param shell - The shell to use (e.g., "bash", "pwsh").
 * @returns A promise that resolves with the execution time and resource usage.
 * @throws If the command execution fails.
 */
export const runCommand = async (
	command: string,
	shell: string,
): Promise<RunResult> => {
	const start = performance.now();
	const proc = Bun.spawn([shell, "-c", command], {
		stdout: "ignore",
		stderr: "ignore",
	});

	await proc.exited;
	const end = performance.now();

	// proc.resourceUsage is available on Bun v1.1.10+
	const usage = proc.resourceUsage?.();

	return {
		timeMs: end - start,
		cpuUserMs: (usage?.cpuTime.user ?? 0) / 1000,
		cpuSystemMs: (usage?.cpuTime.system ?? 0) / 1000,
		maxRssBytes: usage?.maxRSS ?? 0,
		fsReadBytes: 0, // Not available in Bun's resourceUsage API
		fsWriteBytes: 0, // Not available in Bun's resourceUsage API
	};
};
