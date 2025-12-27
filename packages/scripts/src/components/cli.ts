import type { Script, ScriptResult } from "../types";
import { formatScriptResult } from "../utils";

/**
 * CLI component for displaying script information
 * @param script - Script to display
 * @returns Formatted string for CLI display
 */
export const renderScriptInfo = (script: Script): string => {
	const lines: string[] = [];
	lines.push(`Script: ${script.name}`);

	if (script.description) {
		lines.push(`Description: ${script.description}`);
	}

	lines.push(`Command: ${script.command}`);

	if (script.cwd) {
		lines.push(`Working Directory: ${script.cwd}`);
	}

	if (script.dependencies && script.dependencies.length > 0) {
		lines.push(`Dependencies: ${script.dependencies.join(", ")}`);
	}

	if (script.parallel) {
		lines.push("Parallel: true");
	}

	return lines.join("\n");
};

/**
 * CLI component for displaying script results
 * @param results - Script results to display
 * @returns Formatted string for CLI display
 */
export const renderScriptResults = (results: ScriptResult[]): string => {
	const lines: string[] = [];
	lines.push("Script Execution Results:");
	lines.push("========================");

	for (const result of results) {
		lines.push(formatScriptResult(result));
	}

	const successCount = results.filter((r) => r.success).length;
	const failureCount = results.length - successCount;

	lines.push("");
	lines.push(`Summary: ${successCount} succeeded, ${failureCount} failed`);

	return lines.join("\n");
};

/**
 * CLI component for listing scripts
 * @param scripts - Scripts to list
 * @returns Formatted string for CLI display
 */
export const renderScriptList = (scripts: Script[]): string => {
	if (scripts.length === 0) {
		return "No scripts found.";
	}

	const lines: string[] = [];
	lines.push("Available Scripts:");
	lines.push("==================");

	for (const script of scripts) {
		lines.push(
			`${script.name}${script.description ? ` - ${script.description}` : ""}`,
		);
	}

	return lines.join("\n");
};

/**
 * CLI component for displaying help information
 * @returns Formatted string for CLI display
 */
export const renderHelp = (): string => {
	const lines: string[] = [];
	lines.push("Script Runner CLI");
	lines.push("=================");
	lines.push("");
	lines.push("Usage:");
	lines.push("  scripts <command> [options]");
	lines.push("");
	lines.push("Commands:");
	lines.push("  list              List all available scripts");
	lines.push("  run <script>      Run a specific script");
	lines.push("  run-all           Run all scripts");
	lines.push("");
	lines.push("Options:");
	lines.push("  --parallel        Run scripts in parallel");
	lines.push("  --help            Show this help message");
	lines.push("");
	lines.push("Examples:");
	lines.push("  scripts list");
	lines.push("  scripts run build");
	lines.push("  scripts run-all --parallel");

	return lines.join("\n");
};
