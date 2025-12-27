import type { EnvConfig } from "../types/env";

/**
 * Default Environment Configuration
 */
export const DEFAULT_ENV_CONFIG: Required<Omit<EnvConfig, "encryption">> = {
	cache: true,
	encoding: "utf8",
	environment: "development",
	expand: true,
	override: false,
	paths: [".env"],
	strict: false,
	validate: true,
	watch: false,
};

/**
 * Default Environment Paths by Environment
 */
export const ENV_PATHS: Record<string, string[]> = {
	development: [
		".env.development.local",
		".env.local",
		".env.development",
		".env",
	],
	production: [
		".env.production.local",
		".env.local",
		".env.production",
		".env",
	],
	staging: [".env.staging.local", ".env.local", ".env.staging", ".env"],
	test: [".env.test.local", ".env.local", ".env.test", ".env"],
};

/**
 * Common Variable Patterns
 */
export const VARIABLE_PATTERNS = {
	boolean: /^(true|false|1|0|yes|no|on|off)$/i,
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	number: /^-?\d+(\.\d+)?$/,
	port: /^\d{1,5}$/,
	url: /^https?:\/\/.+/,
	uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

/**
 * Sensitive Variable Patterns (for masking)
 */
export const SENSITIVE_PATTERNS = [
	/password/i,
	/secret/i,
	/token/i,
	/key/i,
	/api[_-]?key/i,
	/auth/i,
	/credential/i,
	/private/i,
];

/**
 * Boolean Value Mappings
 */
export const BOOLEAN_VALUES: Record<string, boolean> = {
	"0": false,
	"1": true,
	false: false,
	no: false,
	off: false,
	on: true,
	true: true,
	yes: true,
};
