import type { RunnerOptions, RunnerResult } from "../types";

/**
 * Create a dry run result without executing the command
 */
export const createDryRunResult = (options: RunnerOptions): RunnerResult => {
	const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;
	return {
		command: commandStr,
		exitCode: 0,
		stdout: "",
		stderr: "",
		output: "",
		success: true,
		signal: null,
		duration: 0,
		killed: false,
		timedOut: false,
	};
};

/**
 * Check if should perform dry run
 */
export const shouldDryRun = (dryRun: boolean | undefined): boolean => dryRun === true;

/**
 * Log dry run message
 */
export const logDryRun = (options: RunnerOptions): void => {
	const commandStr = `${options.command} ${options.args?.join(" ") ?? ""}`;
	console.log(`[DRY RUN] Would execute: ${commandStr}`);
};
