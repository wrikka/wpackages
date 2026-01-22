export type RunResult = {
	timeMs: number;
	cpuUserMs: number;
	cpuSystemMs: number;
	maxRssBytes: number;
	fsReadBytes: number;
	fsWriteBytes: number;
};

export type CommandArgv = readonly [string, ...string[]];

export type CommandInput = string | CommandArgv;

const buildShellCommand = (
	shell: string,
	command: string,
): readonly [string, readonly string[]] => {
	if (shell === "pwsh" || shell === "powershell") {
		return [shell, ["-NoProfile", "-NonInteractive", "-Command", command]] as const;
	}

	if (shell === "cmd" || shell === "cmd.exe") {
		return ["cmd.exe", ["/d", "/s", "/c", command]] as const;
	}

	return [shell, ["-c", command]] as const;
};

export const formatCommandInput = (command: CommandInput): string =>
	typeof command === "string" ? command : command.join(" ");

const isArgv = (command: CommandInput): command is CommandArgv => Array.isArray(command);

const toNumber = (value: unknown): number => {
	if (typeof value === "bigint") return Number(value);
	if (typeof value === "number") return value;
	return 0;
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
	const [bin, args] = buildShellCommand(shell, command);
	const proc = Bun.spawn([bin, ...args], {
		stdout: "pipe",
		stderr: "pipe",
	});

	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		const [stdout, stderr] = await Promise.all([
			proc.stdout ? new Response(proc.stdout).text().catch(() => "") : Promise.resolve(""),
			proc.stderr ? new Response(proc.stderr).text().catch(() => "") : Promise.resolve(""),
		]);
		const out = stdout.trim();
		const err = stderr.trim();
		const details = [
			out ? `stdout: ${out.slice(0, 400)}` : "",
			err ? `stderr: ${err.slice(0, 400)}` : "",
		].filter(Boolean).join("\n");
		throw new Error(
			`Command failed with exit code ${exitCode}: ${command}${details ? `\n${details}` : ""}`,
		);
	}
	const end = performance.now();

	// proc.resourceUsage is available on Bun v1.1.10+
	const usage = proc.resourceUsage?.();

	return {
		timeMs: end - start,
		cpuUserMs: toNumber(usage?.cpuTime.user) / 1000,
		cpuSystemMs: toNumber(usage?.cpuTime.system) / 1000,
		maxRssBytes: toNumber(usage?.maxRSS),
		fsReadBytes: 0, // Not available in Bun's resourceUsage API
		fsWriteBytes: 0, // Not available in Bun's resourceUsage API
	};
};

export const runCommandInput = async (
	command: CommandInput,
	shell: string,
): Promise<RunResult> => {
	if (isArgv(command)) {
		const start = performance.now();
		const proc = Bun.spawn(command, {
			stdout: "pipe",
			stderr: "pipe",
		});
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			const [stdout, stderr] = await Promise.all([
				proc.stdout ? new Response(proc.stdout).text().catch(() => "") : Promise.resolve(""),
				proc.stderr ? new Response(proc.stderr).text().catch(() => "") : Promise.resolve(""),
			]);
			const out = stdout.trim();
			const err = stderr.trim();
			const details = [
				out ? `stdout: ${out.slice(0, 400)}` : "",
				err ? `stderr: ${err.slice(0, 400)}` : "",
			].filter(Boolean).join("\n");
			throw new Error(
				`Command failed with exit code ${exitCode}: ${formatCommandInput(command)}${details ? `\n${details}` : ""}`,
			);
		}
		const end = performance.now();
		const usage = proc.resourceUsage?.();
		return {
			timeMs: end - start,
			cpuUserMs: toNumber(usage?.cpuTime.user) / 1000,
			cpuSystemMs: toNumber(usage?.cpuTime.system) / 1000,
			maxRssBytes: toNumber(usage?.maxRSS),
			fsReadBytes: 0,
			fsWriteBytes: 0,
		};
	}

	return runCommand(command, shell);
};
