/**
 * Parse result type
 */

import type { ParseError } from "./parse-error.type";

export type ParseResult = {
	readonly ast: unknown;
	readonly errors: readonly ParseError[];
	readonly sourceType: "module" | "script";
};
