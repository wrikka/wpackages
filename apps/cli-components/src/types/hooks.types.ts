/**
 * Hooks Types - Pure Type Definitions
 * Lifecycle hooks for command execution
 */

import type { ProgramDef, ParseResult } from "./command.types";

/**
 * Hook context
 */
export interface HookContext {
	readonly program: ProgramDef;
	readonly parsed?: unknown;
	readonly error?: unknown;
}

/**
 * Hook function type
 */
export type HookFunction = (
	context: HookContext,
) => Promise<ParseResult<string, void>>;

/**
 * Lifecycle hooks definition
 */
export interface HooksDef {
	readonly beforeAll?: HookFunction;
	readonly beforeEach?: HookFunction;
	readonly afterEach?: HookFunction;
	readonly afterAll?: HookFunction;
	readonly onError?: (error: unknown, context: HookContext) => Promise<void>;
}
