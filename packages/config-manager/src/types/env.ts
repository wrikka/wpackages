import type { ResultType } from "functional";

export type Result<V, E> = ResultType<V, E>;

/**
 * Environment Name
 */
export type EnvironmentName =
	| "development"
	| "production"
	| "test"
	| "staging"
	| string;

/**
 * Variable Type
 */
export type VariableType =
	| "string"
	| "number"
	| "boolean"
	| "json"
	| "array"
	| "url"
	| "email";

/**
 * Environment Variable Schema
 */
export type EnvSchema<T = unknown> = {
	[K in keyof T]: EnvVariable<T[K]>;
};

/**
 * Environment Variable Definition
 */
export type EnvVariable<T = unknown> = {
	type: VariableType;
	required?: boolean;
	default?: T;
	description?: string;
	validate?: (value: unknown) => boolean | string;
	transform?: (value: string) => T;
	sensitive?: boolean; // For encryption/masking
	pattern?: RegExp;
	choices?: readonly T[];
};

/**
 * Environment Configuration
 */
export type EnvConfig = {
	environment?: EnvironmentName;
	paths?: string[];
	encoding?: BufferEncoding;
	override?: boolean;
	expand?: boolean; // Variable expansion ${VAR}
	validate?: boolean;
	strict?: boolean; // Throw on validation errors
	encryption?: EncryptionConfig;
	watch?: boolean; // Hot reload
	cache?: boolean;
};

/**
 * Encryption Configuration
 */
export type EncryptionConfig = {
	enabled: boolean;
	key: string;
	algorithm?: "aes-256-gcm" | "aes-256-cbc";
	prefix?: string; // e.g., "ENC:"
};

/**
 * Environment Manager
 */
export type EnvManager<T = Record<string, unknown>> = {
	config: EnvConfig;
	schema?: EnvSchema<T> | undefined;

	// Core methods
	load: () => Result<void, Error>;
	reload: () => Result<void, Error>;
	get: <K extends keyof T>(key: K) => T[K] | undefined;
	getRequired: <K extends keyof T>(key: K) => Result<T[K], Error>;
	getAll: () => T;
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	has: (key: keyof T) => boolean;

	// Validation
	validate: () => Result<ValidationResult, Error>;
	isValid: () => boolean;

	// Type casting
	getString: (key: keyof T, defaultValue?: string) => string;
	getNumber: (key: keyof T, defaultValue?: number) => number;
	getBoolean: (key: keyof T, defaultValue?: boolean) => boolean;
	getArray: (key: keyof T, separator?: string) => string[];
	getJson: <J = unknown>(key: keyof T) => J | undefined;

	// Utilities
	expand: (value: string) => string;
	encrypt: (value: string) => string;
	decrypt: (value: string) => string;
	toObject: () => Record<string, unknown>;
	generateExample: () => string;
};

/**
 * Validation Result
 */
export type ValidationResult = {
	valid: boolean;
	errors: ValidationError[];
	warnings: string[];
};

/**
 * Validation Error
 */
export type ValidationError = {
	key: string;
	message: string;
	type: "missing" | "invalid" | "type" | "pattern" | "choices";
};

/**
 * Parsed Environment
 */
export type ParsedEnv = Record<string, string>;

/**
 * Environment Source
 */
export type EnvSource = {
	name: string;
	priority: number;
	load: () => Promise<ParsedEnv>;
};

/**
 * File Watch Event
 */
export type FileWatchEvent = {
	type: "change" | "add" | "unlink";
	path: string;
	timestamp: number;
};
