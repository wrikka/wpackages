/**
 * Advanced Configuration Manager Service
 * Provides comprehensive configuration management with:
 * - Multi-source loading (files, environment, defaults)
 * - Variable expansion and validation
 * - Encryption/decryption of sensitive values
 * - Hot-reload with file watching
 * - Type-safe API with full TypeScript support
 */

import type { ConfigLayer, ConfigOptions, LoadedConfig } from "../types/config";
import type { EncryptionConfig, EnvSchema } from "../types/env";
import { decryptValue } from "../utils/encryption.utils";
import { expandEnv } from "../utils/expansion.utils";
import { validateEnv } from "../utils/validate.utils";
import { loadConfig } from "./loader.service";
import { createWatcher } from "./watch.service";

/**
 * Advanced Configuration Manager
 * Manages configuration lifecycle with validation, encryption, and hot-reload
 * @template T Configuration type
 */
export class ConfigManager<T extends Record<string, unknown>> {
	private config: T | null = null;
	private layers: ConfigLayer<T>[] = [];
	private watcher: ReturnType<typeof createWatcher> | null = null;
	private schema: EnvSchema<T> | undefined;
	private encryption: EncryptionConfig | undefined;

	constructor(
		private options: ConfigOptions<T>,
	) {
		this.schema = options.schema;
		this.encryption = options.encryption;
	}

	/**
	 * Load configuration from all sources
	 * Loads from defaults, config files, RC files, and environment variables
	 * Applies variable expansion, validation, and decryption as configured
	 * @returns Promise with loaded configuration and metadata
	 */
	async load(): Promise<LoadedConfig<T>> {
		try {
			const result = await loadConfig(this.options);

			this.config = result.config;
			this.layers = result.layers;

			// Apply variable expansion if enabled
			if (this.options.expandVariables) {
				this.config = expandEnv(this.config as Record<string, string>) as T;
			}

			// Validate configuration if schema is provided
			if (this.schema) {
				const validationResult = validateEnv(this.config as Record<string, string>, this.schema);
				if (!validationResult.valid) {
					throw new Error(`Configuration validation failed: ${validationResult.errors.map(e => e.message).join(", ")}`);
				}
			}

			// Decrypt sensitive values if encryption is enabled
			if (this.encryption?.enabled && this.config) {
				this.config = await this.decryptConfig(this.config);
			}

			return {
				config: this.config as T,
				configFile: result.configFile || undefined,
				layers: this.layers,
			} as LoadedConfig<T>;
		} catch (error) {
			throw new Error(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Reload configuration from all sources
	 * Useful for hot-reload scenarios
	 * @returns Promise with reloaded configuration
	 */
	async reload(): Promise<LoadedConfig<T>> {
		return this.load();
	}

	/**
	 * Get configuration value by key
	 * @template K Configuration key type
	 * @param key Configuration key
	 * @returns Configuration value or undefined if not found
	 */
	get<K extends keyof T>(key: K): T[K] | undefined {
		return this.config?.[key];
	}

	/**
	 * Get required configuration value by key
	 * Throws error if key is missing
	 * @template K Configuration key type
	 * @param key Configuration key
	 * @returns Configuration value
	 * @throws Error if key is missing
	 */
	getRequired<K extends keyof T>(key: K): T[K] {
		const value = this.config?.[key];
		if (value === undefined) {
			throw new Error(`Required configuration key '${String(key)}' is missing`);
		}
		return value;
	}

	/**
	 * Set configuration value
	 * Modifies in-memory configuration (does not persist)
	 * @template K Configuration key type
	 * @param key Configuration key
	 * @param value New configuration value
	 */
	set<K extends keyof T>(key: K, value: T[K]): void {
		if (!this.config) {
			this.config = {} as T;
		}
		this.config[key] = value;
	}

	/**
	 * Check if configuration has key
	 * @param key Configuration key
	 * @returns True if key exists in configuration
	 */
	has(key: keyof T): boolean {
		return this.config ? key in this.config : false;
	}

	/**
	 * Get all configuration as object
	 * @returns Complete configuration object
	 */
	getAll(): T {
		return this.config || ({} as T);
	}

	/**
	 * Start watching for configuration file changes
	 * Automatically reloads configuration when files change
	 * @param onChange Optional callback when configuration changes
	 * @throws Error if watch mode is not enabled
	 */
	watch(onChange?: (config: LoadedConfig<T>) => void): void {
		if (!this.options.watch) {
			throw new Error("Watch mode is not enabled in configuration options");
		}

		try {
			this.watcher = createWatcher({
				paths: this.options.configFile ? [this.options.configFile] : [],
				onChange: async () => {
					try {
						const result = await this.reload();
						if (onChange) {
							onChange(result);
						}
					} catch (error) {
						console.error("Failed to reload configuration:", error);
					}
				},
			});
		} catch (error) {
			throw new Error(`Failed to start watcher: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Stop watching for configuration changes
	 * Cleans up file watchers
	 */
	unwatch(): void {
		if (this.watcher) {
			this.watcher.close?.();
			this.watcher = null;
		}
	}


	/**
	 * Decrypt sensitive configuration values
	 */
	private async decryptConfig(config: T): Promise<T> {
		if (!this.encryption?.enabled) return config;

		const decryptedConfig = { ...config };
		for (const [key, value] of Object.entries(config)) {
			if (typeof value === "string" && value.startsWith(this.encryption.prefix || "ENC:")) {
				try {
					decryptedConfig[key as keyof T] = decryptValue(value, this.encryption) as T[keyof T];
				} catch (error) {
					// If decryption fails, keep the encrypted value
					console.warn(`Failed to decrypt config key '${key}':`, error);
				}
			}
		}
		return decryptedConfig;
	}


	/**
	 * Validate configuration against schema
	 */
	validate(): boolean {
		if (!this.schema || !this.config) {
			return true;
		}

		const validationResult = validateEnv(this.config as Record<string, string>, this.schema);
		if (!validationResult.valid) {
			throw new Error(`Configuration validation failed: ${validationResult.errors.map((e) => e.message).join(", ")}`);
		}

		return true;
	}
}

/**
 * Create configuration manager instance
 */
export const createConfigManager = <T extends Record<string, unknown>>(
	options: ConfigOptions<T>,
): ConfigManager<T> => {
	return new ConfigManager<T>(options);
};

/**
 * Load configuration with advanced features
 */
export const loadAdvancedConfig = async <T extends Record<string, unknown>>(
	options: ConfigOptions<T>,
): Promise<LoadedConfig<T>> => {
	const manager = createConfigManager(options);
	return manager.load();
};
