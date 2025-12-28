/**
 * Suggestion Service - Effect Handler
 * Generate command suggestions for typos
 */

import type { CommandDef, ProgramDef } from "../types";
import { findMostSimilar } from "../utils";

/**
 * Suggest similar command name
 */
export const suggestCommand = (
	unknownCommand: string,
	program: ProgramDef,
	threshold = 0.6,
): string | undefined => {
	if (!program.commands || program.commands.length === 0) {
		return undefined;
	}

	const commandNames = program.commands.map((cmd: CommandDef) => cmd.name);
	return findMostSimilar(unknownCommand, commandNames, threshold);
};

/**
 * Generate error message with suggestion
 */
export const generateSuggestionMessage = (
	unknownCommand: string,
	program: ProgramDef,
): string => {
	const suggestion = suggestCommand(unknownCommand, program);

	if (suggestion) {
		return `Unknown command "${unknownCommand}". Did you mean "${suggestion}"?`;
	}

	const availableCommands = program.commands?.map((cmd: CommandDef) => cmd.name).join(", ") || "none";
	return `Unknown command "${unknownCommand}". Available commands: ${availableCommands}`;
};
