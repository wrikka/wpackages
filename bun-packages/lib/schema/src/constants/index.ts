/**
 * Constants - Application-wide constants
 */

// Regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^https?:\/\/.+/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Error codes
export const ERROR_CODES = {
	TYPE_MISMATCH: 'type_mismatch',
	INVALID_VALUE: 'invalid_value',
	REQUIRED: 'required',
	INVALID_FORMAT: 'invalid_format',
	INVALID_RANGE: 'invalid_range',
	INVALID_LENGTH: 'invalid_length',
	INVALID_PATTERN: 'invalid_pattern',
} as const;

// Schema types
export const SCHEMA_TYPES = {
	STRING: 'string',
	NUMBER: 'number',
	BOOLEAN: 'boolean',
	DATE: 'date',
	ARRAY: 'array',
	OBJECT: 'object',
	UNION: 'union',
	INTERSECTION: 'intersection',
	LITERAL: 'literal',
	ENUM: 'enum',
	RECORD: 'record',
	TUPLE: 'tuple',
	BIGINT: 'bigint',
	SYMBOL: 'symbol',
	UNKNOWN: 'unknown',
	ANY: 'any',
	NEVER: 'never',
} as const;
