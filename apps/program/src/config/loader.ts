/**
 * Config File Loader
 *
 * โหลด program.config.ts จาก project (เหมือน Vite!)
 */

import type { EffectConfig } from "./types";

/**
 * Config file names to search for
 */
const CONFIG_FILES = [
	"program.config.ts",
	"program.config.js",
	"program.config.mjs",
	".programrc.ts",
	".programrc.js",
] as const;

/**
 * Load config from file
 */
export async function loadConfigFromFile(
	rootDir: string = process.cwd(),
): Promise<EffectConfig | null> {
	// Try to load config file
	for (const fileName of CONFIG_FILES) {
		const configPath = `${rootDir}/${fileName}`;

		try {
			// Dynamic import
			const mod = await import(configPath);
			const config = mod.default || mod.config;

			if (config) {
				return typeof config === "function" ? await config() : config;
			}
		} catch {
			// File not found or error loading, continue
		}
	}

	return null;
}

/**
 * Load config using simple schema validation
 */
export async function loadConfigWithManager<T extends Record<string, unknown>>(
	_options: { schema?: Record<string, unknown> },
): Promise<T | null> {
	// Simple implementation - just return null for now
	// Users should use loadConfigFromFile() instead
	return null;
}

/**
 * Create config manager instance (simplified)
 */
export function createProgramConfigManager<T extends Record<string, unknown>>(
	_options: { schema?: Record<string, unknown> },
) {
	return {
		load: async (): Promise<T | null> => null,
	};
}

/**
 * Resolve config with defaults
 */
export function resolveConfig(
	userConfig: EffectConfig | null,
): Required<EffectConfig> {
	return {
		plugins: userConfig?.plugins ?? [],
		cache: { ...userConfig?.cache },
		concurrency: { ...userConfig?.concurrency },
		configManager: { ...userConfig?.configManager },
	};
}

/**
 * Global config instance
 */
let globalConfig: Required<EffectConfig> | null = null;

/**
 * Initialize global config
 */
export async function initConfig(
	configOrPath?: EffectConfig | string,
): Promise<Required<EffectConfig>> {
	let userConfig: EffectConfig | null = null;

	if (typeof configOrPath === "string") {
		userConfig = await loadConfigFromFile(configOrPath);
	} else if (configOrPath) {
		userConfig = configOrPath;
	} else {
		userConfig = await loadConfigFromFile();
	}

	globalConfig = resolveConfig(userConfig);
	return globalConfig;
}

/**
 * Get global config
 */
export function getConfig(): Required<EffectConfig> {
	if (!globalConfig) {
		globalConfig = resolveConfig(null);
	}
	return globalConfig;
}

/**
 * Set global config
 */
export function setConfig(config: EffectConfig): void {
	globalConfig = resolveConfig(config);
}

/**
 * Reset global config
 */
export function resetConfig(): void {
	globalConfig = null;
}
