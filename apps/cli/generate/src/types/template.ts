/**
 * Template definition
 */
export interface Template {
	/** Template name */
	readonly name: string;
	/** Template content */
	readonly content: string;
	/** Template description */
	readonly description?: string;
	/** Required variables */
	readonly requiredVariables?: readonly string[];
}

/**
 * File template for generation
 */
export interface FileTemplate extends Template {
	/** Output file path pattern */
	readonly path: string;
	/** File extension */
	readonly extension?: string;
}

/**
 * Code generator result
 */
export interface GeneratorResult {
	/** Generated file path */
	readonly path: string;
	/** Generated content */
	readonly content: string;
	/** Whether file was created (true) or updated (false) */
	readonly created: boolean;
	/** Any warnings during generation */
	readonly warnings?: readonly string[];
}

/**
 * Generator execution result
 */
export interface GenerateResult {
	/** Successfully generated files */
	readonly files: readonly GeneratorResult[];
	/** Failed generations */
	readonly errors: readonly GeneratorError[];
	/** Total execution time in ms */
	readonly duration: number;
}

/**
 * Generator error
 */
export interface GeneratorError {
	/** File path that failed */
	readonly path: string;
	/** Error message */
	readonly message: string;
	/** Original error if available */
	readonly error?: Error;
}
