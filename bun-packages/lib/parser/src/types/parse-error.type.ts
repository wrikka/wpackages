/**
 * Parse error type
 */

export type ParseError = {
	readonly message: string;
	readonly line: number;
	readonly column: number;
};
