/**
 * Supported document formats
 */
export type DocumentFormat = "markdown" | "typescript" | "toml" | "json";

/**
 * Generic document representation
 */
export interface Document {
	format: DocumentFormat;
	content: string;
	metadata?: Record<string, unknown>;
}

/**
 * Parsed AST representation
 */
export interface ParsedDocument {
	format: DocumentFormat;
	ast: unknown;
	metadata?: Record<string, unknown>;
}

/**
 * Transform options
 */
export interface TransformOptions {
	pretty?: boolean;
	indent?: number;
	preserveComments?: boolean;
}

/**
 * Parser interface
 */
export interface Parser<T = unknown> {
	format: DocumentFormat;
	parse: (content: string) => T;
	stringify: (ast: T, options?: TransformOptions) => string;
}

/**
 * Transformer interface
 */
export interface Transformer {
	from: DocumentFormat;
	to: DocumentFormat;
	transform: (source: string, options?: TransformOptions) => string;
}
