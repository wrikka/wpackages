import { RUNNER_DEFAULTS } from "../constant";
import type { RunnerOptions } from "../types";

/**
 * Parse command string into command and args
 */
export const parseCommand = (
	input: string | readonly [string, ...string[]],
): { command: string; args: string[] } => {
	if (Array.isArray(input)) {
		const [command, ...args] = input;
		return { command, args };
	}

	// Simple parsing - split by spaces, respecting quotes
	const parts: string[] = [];
	let current = "";
	let inQuote = false;
	let quoteChar = "";

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		if ((char === "\"" || char === "'") && !inQuote) {
			inQuote = true;
			quoteChar = char;
		} else if (char === quoteChar && inQuote) {
			inQuote = false;
			quoteChar = "";
		} else if (char === " " && !inQuote) {
			if (current) {
				parts.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}

	if (current) {
		parts.push(current);
	}

	const [command, ...args] = parts;
	return { command: command || "", args };
};

/**
 * Build command string from command and args
 */
export const buildCommand = (
	command: string,
	args?: readonly string[],
): string => {
	if (!args || args.length === 0) {
		return command;
	}

	const escapedArgs = args.map((arg) => {
		// Escape arguments that contain spaces or special characters
		if (/[\s"'$`\\]/.test(arg)) {
			return `"${arg.replace(/"/g, "\\\"")}"`;
		}
		return arg;
	});

	return `${command} ${escapedArgs.join(" ")}`;
};

/**
 * Parse environment variables
 */
export const parseEnv = (
	env?: Readonly<Record<string, string>>,
): Record<string, string> => {
	if (!env) {
		return { ...process.env } as Record<string, string>;
	}

	return {
		...process.env,
		...env,
	} as Record<string, string>;
};

/**
 * Normalize options
 */
export const normalizeOptions = (
	options: Partial<RunnerOptions>,
):
	& Required<
		Pick<
			RunnerOptions,
			| "encoding"
			| "stripFinalNewline"
			| "preferLocal"
			| "rejectOnError"
			| "stdout"
			| "stderr"
			| "stdin"
			| "verbose"
			| "dryRun"
			| "inheritStdio"
		>
	>
	& Partial<RunnerOptions> =>
{
	return {
		...options,
		encoding: options.encoding ?? RUNNER_DEFAULTS.encoding,
		stripFinalNewline: options.stripFinalNewline ?? RUNNER_DEFAULTS.stripFinalNewline,
		preferLocal: options.preferLocal ?? RUNNER_DEFAULTS.preferLocal,
		rejectOnError: options.rejectOnError ?? RUNNER_DEFAULTS.rejectOnError,
		stdout: options.stdout === false ? "ignore" : (options.stdout ?? RUNNER_DEFAULTS.stdout),
		stderr: options.stderr === false ? "ignore" : (options.stderr ?? RUNNER_DEFAULTS.stderr),
		stdin: options.stdin === false ? "ignore" : (options.stdin ?? RUNNER_DEFAULTS.stdin),
		verbose: options.verbose ?? RUNNER_DEFAULTS.verbose,
		dryRun: options.dryRun ?? RUNNER_DEFAULTS.dryRun,
		inheritStdio: options.inheritStdio ?? RUNNER_DEFAULTS.inheritStdio,
	};
};

/**
 * Strip final newline from string
 */
export const stripFinalNewline = (input: string): string => {
	return input.replace(/\r?\n$/, "");
};

/**
 * Get local binaries path
 */
export const getLocalBinPath = (cwd?: string): string => {
	const localDir = cwd ?? process.cwd();
	return `${localDir}/node_modules/.bin`;
};

/**
 * Build PATH with local binaries
 */
export const buildPath = (options: {
	preferLocal?: boolean;
	localDir?: string;
	cwd?: string;
}): string => {
	const { preferLocal, localDir, cwd } = options;

	if (!preferLocal) {
		return process.env["PATH"] ?? "";
	}

	const localBinPath = localDir ?? getLocalBinPath(cwd);
	const pathSeparator = process.platform === "win32" ? ";" : ":";

	return `${localBinPath}${pathSeparator}${process.env["PATH"] ?? ""}`;
};
