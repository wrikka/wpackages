/**
 * OXC Parser Wrapper
 * Wraps the OXC parser for JavaScript/TypeScript/JSX/TSX
 */

import { parseSync } from "oxc-parser";

export interface OXCParseOptions {
	readonly typescript?: boolean;
	readonly jsx?: boolean;
	readonly sourceType?: "module" | "script";
	readonly allowReturnOutsideFunction?: boolean;
}

/**
 * Parse JavaScript/TypeScript with OXC
 * Pure wrapper around oxc-parser
 */
export const parseWithOXC = (
	source: string,
	options: OXCParseOptions = {},
) => {
	try {
		const result = parseSync("input.ts", source, options);
		return result;
	} catch (error) {
		throw new Error(`OXC parsing failed: ${error instanceof Error ? error.message : String(error)}`);
	}
};
