/**
 * Middleware Types - Pure Type Definitions
 * Middleware system for command execution pipeline
 */

import type { ParsedCLI, ParseResult, ProgramDef } from "./command.types";

/**
 * Middleware context
 */
export interface MiddlewareContext {
	readonly program: ProgramDef;
	readonly parsed: ParsedCLI;
	readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Next function type
 */
export type MiddlewareNext = () => Promise<ParseResult<string, void>>;

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
	context: MiddlewareContext,
	next: MiddlewareNext,
) => Promise<ParseResult<string, void>>;

/**
 * Middleware definition
 */
export interface MiddlewareDef {
	readonly name: string;
	readonly fn: MiddlewareFunction;
	readonly order?: number;
}
