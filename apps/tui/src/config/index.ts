export * from "./display.config";
export * from "./input.config";
export * from "./program.config";
export * from "./prompt.config";

// Re-export all types through config
export type {
	ArgumentDef,
	CommandAction,
	CommandDef,
	OptionDef,
	OptionValue,
	ParsedCLI,
	ParseError,
	ProgramDef,
} from "../types/command.types";
export type { CommandGroup, ConfigFileDef, EnvMapping, ExtendedProgramOptions } from "../types/config.types";

export type { HookContext, HookFunction, HooksDef } from "../types/hooks.types";
export type { MiddlewareContext, MiddlewareDef, MiddlewareFunction, MiddlewareNext } from "../types/middleware.types";
export type {
	CompletionPluginOptions,
	LoggingPluginOptions,
	PluginContext,
	PluginDef,
	ValidationPluginOptions,
} from "../types/plugin.types";
