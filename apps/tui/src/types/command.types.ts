/**
 * Command Types - Frozen Type Definitions
 * Better than commander.js with full type safety
 */

/**
 * Option value types
 */
export type OptionValue = string | number | boolean | string[];

/**
 * Simple Result type for parser
 */
export type ParseResult<E, A> = { _tag: "Success"; value: A } | { _tag: "Failure"; error: E };

/**
 * Command option definition
 */
export interface OptionDef<T = OptionValue> {
	readonly flags: string;
	readonly description: string;
	readonly default?: T;
	readonly choices?: readonly T[];
	readonly required?: boolean;
	readonly parse?: (value: string) => ParseResult<string, T>;
}

/**
 * Argument definition
 */
export interface ArgumentDef {
	readonly name: string;
	readonly description: string;
	readonly required?: boolean;
	readonly variadic?: boolean;
}

/**
 * Command action with Result type
 */
export type CommandAction<T = Record<string, OptionValue>> = (
	options: T,
	args: readonly string[],
) => Promise<ParseResult<string, void>>;

/**
 * Command definition
 */
export interface CommandDef<T = Record<string, OptionValue>> {
	readonly name: string;
	readonly description: string;
	readonly options?: Readonly<Record<string, OptionDef>>;
	readonly arguments?: readonly ArgumentDef[];
	readonly action: CommandAction<T>;
	readonly examples?: readonly string[];
	readonly aliases?: readonly string[];
}

/**
 * Program definition
 */
export interface ProgramDef {
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly options?: Readonly<Record<string, OptionDef>>;
	readonly commands?: readonly CommandDef[];
	readonly defaultAction?: CommandAction;
	readonly middleware?: readonly import("./middleware.types").MiddlewareDef[];
	readonly hooks?: import("./hooks.types").HooksDef;
	readonly plugins?: readonly import("./plugin.types").PluginDef[];
	readonly envMapping?: import("./config.types").EnvMapping;
	readonly configFile?: import("./config.types").ConfigFileDef;
	readonly groups?: readonly import("./config.types").CommandGroup[];
}

/**
 * Parsed CLI result
 */
export interface ParsedCLI<T = Record<string, OptionValue>> {
	readonly command: string | undefined;
	readonly options: T;
	readonly args: readonly string[];
}

/**
 * Parse error types
 */
export type ParseError =
	| { readonly type: "UNKNOWN_OPTION"; readonly option: string }
	| { readonly type: "MISSING_REQUIRED"; readonly option: string }
	| {
		readonly type: "INVALID_VALUE";
		readonly option: string;
		readonly value: string;
	}
	| { readonly type: "UNKNOWN_COMMAND"; readonly command: string }
	| { readonly type: "PARSE_ERROR"; readonly message: string };
