import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateVitextConfig } from "../components/config-validator";
import { DEFAULT_VITEXT_CONFIG } from "../constant/defaults";
import type { VitextConfig } from "../types/config";
import { logError, logInfo } from "../utils/logger";

/**
 * Vitext Configuration Loader
 *
 * Loads and validates vitext.config.ts files
 */

export class ConfigLoader {
	/**
	 * Load configuration from vitext.config.ts file
	 */
	static async loadConfig(root: string = process.cwd()): Promise<VitextConfig> {
		// Try to find config file
		const configPath = this.findConfigFile(root);

		if (!configPath) {
			logInfo("No vitext.config.ts found, using default configuration");
			return DEFAULT_VITEXT_CONFIG;
		}

		try {
			logInfo(`Loading configuration from ${configPath}`);

			// Import the config file
			const configModule = await import(pathToFileURL(configPath).toString());
			const config = configModule.default || configModule;

			// Merge with default config
			return {
				...DEFAULT_VITEXT_CONFIG,
				...config,
				server: {
					...DEFAULT_VITEXT_CONFIG.server,
					...config.server,
				},
				build: config.build
					? {
						...DEFAULT_VITEXT_CONFIG.build,
						...config.build,
					}
					: DEFAULT_VITEXT_CONFIG.build,
				plugins: config.plugins ?? DEFAULT_VITEXT_CONFIG.plugins,
				rolldown: config.rolldown
					? {
						...DEFAULT_VITEXT_CONFIG.rolldown,
						...config.rolldown,
					}
					: DEFAULT_VITEXT_CONFIG.rolldown,
			};
		} catch (error) {
			logError(
				`Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			return DEFAULT_VITEXT_CONFIG;
		}
	}

	/**
	 * Find vitext.config.ts file in the project
	 */
	private static findConfigFile(root: string): string | null {
		const possibleNames = [
			"vitext.config.ts",
			"vitext.config.js",
			"vitext.config.mjs",
		];

		for (const name of possibleNames) {
			const configPath = join(root, name);
			if (existsSync(configPath)) {
				return resolve(configPath);
			}
		}

		return null;
	}

	/**
	 * Validate configuration
	 */
	static validateConfig(config: VitextConfig): boolean {
		const validation = validateVitextConfig(config);

		if (!validation.valid) {
			for (const error of validation.errors) {
				logError(error);
			}
		}

		return validation.valid;
	}
}

/**
 * Define configuration with type safety
 */
export const defineConfig = (config: Partial<VitextConfig>): VitextConfig => {
	return {
		...DEFAULT_VITEXT_CONFIG,
		...config,
		server: {
			...DEFAULT_VITEXT_CONFIG.server,
			...config.server,
		},
		build: {
			...DEFAULT_VITEXT_CONFIG.build,
			...config.build,
		},
		plugins: config.plugins ?? DEFAULT_VITEXT_CONFIG.plugins,
		rolldown: {
			...DEFAULT_VITEXT_CONFIG.rolldown,
			...config.rolldown,
		},
	};
};
