/**
 * Parser Configuration
 * Central configuration for parser behavior and defaults
 */

export const PARSER_CONFIG = {
	// Default options for parsing
	defaults: {
		strict: false,
		includeMetadata: true,
		preserveComments: true,
	},

	// Language detection settings
	detection: {
		caseSensitive: false,
		allowUnknown: false,
	},

	// Performance settings
	performance: {
		maxFileSize: 10 * 1024 * 1024, // 10MB
		enableCaching: true,
		cacheSize: 100, // number of parsed files to cache
	},

	// Error handling
	errors: {
		throwOnError: false,
		collectErrors: true,
		maxErrors: 100,
	},
} as const;

export type ParserConfig = typeof PARSER_CONFIG;
