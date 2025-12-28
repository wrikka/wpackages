/**
 * Error Components - Pure Functions
 * Generate beautiful error messages
 */

import type { ParseError, ProgramDef } from "../types";
import { generateSuggestionMessage } from "../services/suggestion.service";

/**
 * Format parse error to user-friendly message
 */
export const formatParseError = (
	error: ParseError,
	program: ProgramDef,
): string => {
	switch (error.type) {
		case "UNKNOWN_COMMAND":
			return `✗ ${generateSuggestionMessage(error.command, program)}`;

		case "UNKNOWN_OPTION":
			return `✗ Unknown option: ${error.option}`;

		case "MISSING_REQUIRED":
			return `✗ Missing required option: ${error.option}`;

		case "INVALID_VALUE":
			return `✗ Invalid value for option ${error.option}: ${error.value}`;

		case "PARSE_ERROR":
			return `✗ Parse error: ${error.message}`;

		default:
			return `✗ Unknown error`;
	}
};

/**
 * Format command list
 */
export const formatCommandList = (program: ProgramDef): string => {
	if (!program.commands || program.commands.length === 0) {
		return "No commands available";
	}

	const lines = ["Available commands:"];

	for (const cmd of program.commands) {
		const aliases = cmd.aliases?.length
			? ` (aliases: ${cmd.aliases.join(", ")})`
			: "";
		lines.push(`  • ${cmd.name}${aliases} - ${cmd.description}`);
	}

	return lines.join("\n");
};

/**
 * Create error message with context
 */
export const createErrorMessage = (
	title: string,
	details: string[],
	suggestion?: string,
): string => {
	const lines = [`\n✗ ${title}`, ""];

	for (const detail of details) {
		lines.push(`  ${detail}`);
	}

	if (suggestion) {
		lines.push("", `💡 ${suggestion}`);
	}

	return lines.join("\n");
};
