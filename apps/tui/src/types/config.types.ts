/**
 * Config Types - Pure Type Definitions
 * Configuration file and environment mapping
 */

import type { OptionValue, ParseResult } from "./command.types";

/**
 * Environment variable mapping
 */
export interface EnvMapping {
	readonly [envKey: string]: string;
}

/**
 * Config file definition
 */
export interface ConfigFileDef {
	readonly path?: string;
	readonly loader?: (
		path: string,
	) => Promise<ParseResult<string, Record<string, unknown>>>;
	readonly required?: boolean;
}

/**
 * Command group definition
 */
export interface CommandGroup {
	readonly title: string;
	readonly commands: readonly string[];
	readonly description?: string;
}

/**
 * Extended program options
 */
export interface ExtendedProgramOptions {
	readonly envMapping?: EnvMapping;
	readonly configFile?: ConfigFileDef;
	readonly groups?: readonly CommandGroup[];
	readonly globalOptions?: Readonly<Record<string, OptionValue>>;
}
