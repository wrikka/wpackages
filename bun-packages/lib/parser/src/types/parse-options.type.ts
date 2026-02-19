/**
 * Parse options for OXC parser
 */

export type ParseOptions = {
	readonly sourceFilename?: string;
	readonly sourceType?: "module" | "script";
	readonly typescript?: boolean;
	readonly jsx?: boolean;
};
