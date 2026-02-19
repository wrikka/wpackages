/**
 * Configuration - Static configuration only
 */

import type { Schema } from '../types';

/**
 * Default schema configuration
 */
export const DEFAULT_CONFIG = {
	// Parsing behavior
	strict: false,
	passthrough: false,
	
	// Error handling
	detailedErrors: true,
	customErrors: false,
	
	// Performance
	enableCache: false,
	maxCacheSize: 1000,
} as const;

/**
 * Schema builder configuration
 */
export interface SchemaConfig {
	strict?: boolean;
	passthrough?: boolean;
	detailedErrors?: boolean;
	customErrors?: boolean;
	enableCache?: boolean;
	maxCacheSize?: number;
}

/**
 * Global configuration
 */
let globalConfig: SchemaConfig = { ...DEFAULT_CONFIG };

/**
 * Get global configuration
 */
export function getConfig(): SchemaConfig {
	return { ...globalConfig };
}

/**
 * Set global configuration
 */
export function setConfig(config: Partial<SchemaConfig>): void {
	globalConfig = { ...globalConfig, ...config };
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
	globalConfig = { ...DEFAULT_CONFIG };
}

/**
 * Create configuration for specific schema
 */
export function createSchemaConfig(config: Partial<SchemaConfig> = {}): SchemaConfig {
	return { ...DEFAULT_CONFIG, ...config };
}
