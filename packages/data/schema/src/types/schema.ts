/**
 * Schema Library - Type Definitions
 */

/**
 * Base issue type for validation errors
 */
export interface SchemaIssue {
	path: (string | number)[];
	message: string;
	code: string;
	value?: unknown;
}

/**
 * Result type for successful parsing
 */
export interface SafeParseSuccess<T> {
	success: true;
	data: T;
}

/**
 * Result type for failed parsing
 */
export interface SafeParseFailure {
	success: false;
	errors: SchemaIssue[];
}

/**
 * Result type for safe parsing
 */
export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

/**
 * Context for validation
 */
export interface ParseContext {
	path: (string | number)[];
	issues: SchemaIssue[];
	addIssue: (issue: Omit<SchemaIssue, "path"> & { path?: (string | number)[] }) => void;
}

/**
 * Validator function type
 */
export type Validator<T> = (value: T, ctx: ParseContext) => boolean | void;

/**
 * Transform function type
 */
export type Transform<T, U> = (value: T) => U;

/**
 * Schema shape for object schemas
 */
export type SchemaShape = Record<string, Schema<unknown>>;

/**
 * Infer shape type from schema shape
 */
export type InferShape<T extends SchemaShape> = {
	[K in keyof T]: T[K] extends Schema<infer U> ? U : never;
};

/**
 * Infer type from schema
 */
export type Infer<T extends Schema<unknown>> = T extends Schema<infer U> ? U : never;

/**
 * Infer input type from schema
 */
export type InferIn<T extends Schema<unknown>> = T extends Schema<infer U> ? U : never;

// Forward declaration for Schema class
import type { Schema } from "../lib/base";
export type { Schema };
