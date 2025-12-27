/**
 * tui - A functional TypeScript TUI framework
 *
 * This is the main entry point for the TUI framework.
 * It provides a functional approach to building command-line interfaces.
 */

// Core exports
export * from "./app";
export * from "./constants";
export * from "./types";

// Re-export modules
export * from "./components";
export * from "./config";
export * from "./lib";
export * from "./services";
export * from "./utils";

// Main entry points
export { createTui, runCLI, runCLIWithResult, TuiApp } from "./app";
export { createTui as default } from "./app";

// Parsers (unified - includes both sync and Result-based variants)
export * from "./parser";

// ===== Prompt CLI Exports =====

// Types
export type {
	ConfirmPromptOptions,
	MultiSelectPromptOptions,
	NumberPromptOptions,
	SearchPromptOptions,
	SelectOption,
	SelectPromptOptions,
	TextPromptOptions,
} from "./types";

// Components (Pure Functions)
export {
	AutocompletePrompt,
	confirm,
	multiselect,
	number,
	password,
	search as searchComponent,
	select,
	text,
} from "./components/input";

// Services (Effect Handlers)
export {
	interactiveConfirm,
	interactiveMultiSelect,
	interactiveNumber,
	interactiveSelect,
	interactiveText,
} from "./interactive";

export { interactiveSearch } from "./search";

// Config
export { PROMPT_CONFIG, type PromptConfig } from "./config";
