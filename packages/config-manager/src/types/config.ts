import type { EncryptionConfig, EnvSchema } from "./env";

/**
 * Configuration Options
 */
export type ConfigOptions<T extends Record<string, unknown>> = {
	/**
	 * Configuration name (used for file lookup)
	 */
	name?: string;

	/**
	 * Current working directory
	 */
	cwd?: string;

	/**
	 * Path to configuration file
	 */
	configFile?: string;

	/**
	 * Path to RC file
	 */
	rcFile?: string;

	/**
	 * Default configuration values
	 */
	defaultConfig?: Partial<T>;

	/**
	 * Environment variable prefix
	 */
	envPrefix?: string;

	/**
	 * Configuration file extensions to look for
	 */
	extensions?: readonly string[];

	/**
	 * Configuration schema for validation
	 */
	schema?: EnvSchema<T>;

	/**
	 * Encryption configuration
	 */
	encryption?: EncryptionConfig;

	/**
	 * Enable variable expansion
	 */
	expandVariables?: boolean;

	/**
	 * Enable file watching for hot reload
	 */
	watch?: boolean;

	/**
	 * Enable caching
	 */
	cache?: boolean;
};

/**
 * Configuration Layer
 */
export type ConfigLayer<T> = {
	config: Partial<T>;
	source: string;
	sourceType: "default" | "file" | "env" | "remote";
};

/**
 * Loaded Configuration
 */
export type LoadedConfig<T> = {
	config: T;
	configFile?: string;
	layers: ConfigLayer<T>[];
};

/**
 * Configuration Error
 */
export type ConfigError = {
	_tag: "ConfigError";
	message: string;
	cause?: unknown;
};

/**
 * Create a configuration error
 */
export const configError = (message: string, cause?: unknown): ConfigError => ({
	_tag: "ConfigError",
	message,
	cause,
});

/**
 * Configuration Preset
 */
export type ConfigPreset<T> = {
	name: string;
	config: Partial<T>;
	description?: string;
};

/**
 * Remote Configuration Options
 */
export type RemoteConfigOptions = {
	url: string;
	headers?: Record<string, string>;
	timeout?: number;
	retry?: number;
};
