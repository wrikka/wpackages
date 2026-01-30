/**
 * Program Config - Factory Functions
 * Create program definitions with defaults
 */

import type { CommandDef, ProgramDef } from "../types/command.types";

/**
 * Create program with defaults
 */
export const createProgram = (config: ProgramDef): ProgramDef => {
	return config;
};

/**
 * Create command with defaults
 */
export const createCommand = <T = Record<string, unknown>>(
	config: CommandDef<T>,
): CommandDef<T> => {
	return config;
};

/**
 * Default command configuration
 */
export const DEFAULT_COMMAND_CONFIG = Object.freeze(
	{
		/**
		 * Default help flag
		 */
		helpFlags: Object.freeze(["--help", "-h"] as const),
		/**
		 * Maximum argument length to parse
		 */
		maxArgs: 100,

		/**
		 * Enable strict mode (throw on unknown options)
		 */
		strictMode: false,

		/**
		 * Default version flag
		 */
		versionFlags: Object.freeze(["--version", "-V"] as const),
	} as const,
);

export type CommandConfig = typeof DEFAULT_COMMAND_CONFIG;
