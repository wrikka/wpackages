/**
 * Design Pattern Configuration
 * Settings for pattern behavior and validation
 */

export const PATTERN_CONFIG = {
	// Pattern validation
	validateInputs: true,
	throwOnInvalidInput: false,

	// Pattern behavior
	enableCaching: true,
	maxCacheSize: 100,

	// Pattern logging
	logPatternUsage: false,
	logLevel: "info" as const,

	// Pattern composition
	allowComposition: true,
	maxCompositionDepth: 10,
} as const;

export type PatternConfig = typeof PATTERN_CONFIG;
