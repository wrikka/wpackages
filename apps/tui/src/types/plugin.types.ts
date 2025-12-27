/**
 * Plugin Types - Pure Type Definitions
 * Plugin system for extending CLI functionality
 */

import type { CommandDef, ProgramDef, ParseResult } from "./command.types";
import type { HooksDef } from "./hooks.types";
import type { MiddlewareDef } from "./middleware.types";

/**
 * Plugin context
 */
export interface PluginContext {
	readonly program: ProgramDef;
}

/**
 * Plugin definition
 */
export interface PluginDef {
	readonly name: string;
	readonly version?: string;
	readonly description?: string;

	readonly setup?: (
		context: PluginContext,
	) => Promise<ParseResult<string, void>>;

	readonly middleware?: readonly MiddlewareDef[];
	readonly hooks?: HooksDef;

	readonly modifyProgram?: (
		program: ProgramDef,
	) => Promise<ParseResult<string, ProgramDef>>;

	readonly modifyCommand?: (
		command: CommandDef,
	) => Promise<ParseResult<string, CommandDef>>;
}

/**
 * Built-in plugin options
 */
export interface LoggingPluginOptions {
	readonly enabled?: boolean;
	readonly level?: "debug" | "info" | "warn" | "error";
	readonly format?: "json" | "pretty";
}

export interface ValidationPluginOptions {
	readonly strict?: boolean;
	readonly customValidators?: Readonly<
		Record<string, (value: unknown) => ParseResult<string, unknown>>
	>;
}

export interface CompletionPluginOptions {
	readonly shell?: "bash" | "zsh" | "fish";
	readonly output?: string;
}
