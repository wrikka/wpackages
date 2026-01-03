/**
 * Represents the result of a parsing operation.
 * It's a discriminated union for type safety.
 */
export type ParseResult<T> =
	| { success: true; data: T }
	| { success: false; error: ParseError };

/**
 * Represents a detailed parsing error, containing the path and all issues.
 */
export type ParseError = {
	message: string;
	path: (string | number)[];
	issues: ParseIssue[];
};

/**
 * Represents a single, specific validation issue.
 */
export type ParseIssue = {
	kind: string; // e.g., 'type', 'min_length', 'invalid_format'
	message: string;
};

/**
 * The core Schema object.
 * Contains the parsing function and can be extended with more functionality.
 */
export type Schema<T> = {
	/**
	 * The internal parsing function. Avoid using this directly.
	 * @param input The unknown value to parse.
	 * @returns A ParseResult object.
	 */
	_parse: (input: unknown) => ParseResult<T>;
};

/**
 * A utility type to infer the output type of a schema.
 * @example type User = TypeOf<typeof userSchema>;
 */
export type TypeOf<S> = S extends Schema<infer T> ? T : never;
