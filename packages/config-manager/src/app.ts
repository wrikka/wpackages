/**
 * Application Composition Layer
 * Composes all services and utilities for configuration management
 * Provides high-level API for loading, managing, and watching configurations
 */

import type { ConfigOptions, LoadedConfig } from "./types/config";
import { createConfigManager, loadAdvancedConfig } from "./services/config-manager.service";

/**
 * Configuration Application Instance
 * Provides a fluent interface for configuration management operations
 * @template T Configuration type
 */
export interface ConfigApp<T extends Record<string, unknown>> {
	/**
	 * Load configuration from all sources (defaults, files, env)
	 * Applies variable expansion, validation, and decryption as configured
	 * @returns Promise with loaded configuration and metadata
	 */
	load(): Promise<LoadedConfig<T>>;

	/**
	 * Reload configuration from all sources
	 * Useful for hot-reload scenarios
	 * @returns Promise with reloaded configuration
	 */
	reload(): Promise<LoadedConfig<T>>;

	/**
	 * Get configuration value by key
	 * @template K Configuration key type
	 * @param key Configuration key
	 * @returns Configuration value or undefined if not found
	 */
	get<K extends keyof T>(key: K): T[K] | undefined;

	/**
	 * Get required configuration value by key
	 * Throws error if key is missing
	 * @template K Configuration key type
	 * @param key Configuration key
	 * @returns Configuration value
	 * @throws Error if key is missing
	 */
	getRequired<K extends keyof T>(key: K): T[K];

	/**
	 * Set configuration value
	 * Modifies in-memory configuration (does not persist)
	 * @template K Configuration key type
	 * @param key Configuration key
	 * @param value New configuration value
	 */
	set<K extends keyof T>(key: K, value: T[K]): void;

	/**
	 * Check if configuration has key
	 * @param key Configuration key
	 * @returns True if key exists in configuration
	 */
	has(key: keyof T): boolean;

	/**
	 * Get all configuration as object
	 * @returns Complete configuration object
	 */
	getAll(): T;

	/**
	 * Start watching for configuration file changes
	 * Automatically reloads configuration when files change
	 * @param onChange Optional callback when configuration changes
	 */
	watch(onChange?: (config: LoadedConfig<T>) => void): void;

	/**
	 * Stop watching for configuration changes
	 * Cleans up file watchers
	 */
	unwatch(): void;

	/**
	 * Validate configuration against schema
	 * Throws error if validation fails
	 * @returns True if validation passes
	 * @throws Error if validation fails
	 */
	validate(): boolean;
}

/**
 * Create a configuration application instance
 * Provides functional interface for configuration management
 * @template T Configuration type
 * @param options Configuration options
 * @returns Configuration application instance
 * @example
 * ```ts
 * const app = createConfigApp<MyConfig>({
 *   name: 'my-app',
 *   cwd: process.cwd(),
 *   configFile: 'config.json',
 * });
 * const config = await app.load();
 * ```
 */
export const createConfigApp = <T extends Record<string, unknown>>(
	options: ConfigOptions<T>,
): ConfigApp<T> => {
	const manager = createConfigManager(options);

	return {
		load: () => manager.load(),
		reload: () => manager.reload(),
		get: <K extends keyof T>(key: K) => manager.get(key),
		getRequired: <K extends keyof T>(key: K) => manager.getRequired(key),
		set: <K extends keyof T>(key: K, value: T[K]) => manager.set(key, value),
		has: (key: keyof T) => manager.has(key),
		getAll: () => manager.getAll(),
		watch: (onChange?: (config: LoadedConfig<T>) => void) => manager.watch(onChange),
		unwatch: () => manager.unwatch(),
		validate: () => manager.validate(),
	};
};

/**
 * Load configuration with advanced features (functional interface)
 * Single-shot configuration loading without app instance
 * @template T Configuration type
 * @param options Configuration options
 * @returns Promise with loaded configuration
 * @example
 * ```ts
 * const config = await loadConfig<MyConfig>({
 *   name: 'my-app',
 *   configFile: 'config.json',
 * });
 * ```
 */
export const loadConfig = <T extends Record<string, unknown>>(
	options: ConfigOptions<T>,
): Promise<LoadedConfig<T>> => {
	return loadAdvancedConfig(options);
};

/**
 * Define configuration (identity function for type inference)
 * Helps TypeScript infer configuration type from object literal
 * @template T Configuration type
 * @param config Configuration object
 * @returns Same configuration object
 * @example
 * ```ts
 * const config = defineConfig({
 *   port: 3000,
 *   debug: true,
 * });
 * ```
 */
export const defineConfig = <T extends Record<string, unknown>>(config: T): T => config;
