import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ConfigLayer, ConfigOptions, LoadedConfig } from "../types/config";
import { configError } from "../types/config";
import { mergeConfigs } from "../utils/merge";
import { findConfigFile, findRcFile } from "../utils/path";

const DEFAULT_EXTENSIONS = [".json", ".js", ".ts", ".mjs", ".cjs"] as const;

const loadJsonFile = <T>(filePath: string): T => {
	const content = readFileSync(filePath, "utf-8");
	return JSON.parse(content) as T;
};

const loadJsFile = async <T>(filePath: string): Promise<T> => {
	const imported = await import(filePath);
	return (imported.default ?? imported) as T;
};

const loadFile = async <T>(filePath: string): Promise<Partial<T>> => {
	const ext = filePath.slice(filePath.lastIndexOf("."));

	if (ext === ".json") {
		return loadJsonFile<Partial<T>>(filePath);
	}

	if ([".js", ".ts", ".mjs", ".cjs"].includes(ext)) {
		return loadJsFile<Partial<T>>(filePath);
	}

	throw new Error(`Unsupported file extension: ${ext}`);
};

const loadEnvConfig = <T>(envPrefix: string): Partial<T> => {
	const config: Record<string, unknown> = {};
	const prefix = envPrefix.toUpperCase();

	for (const key in process.env) {
		if (key.startsWith(prefix)) {
			const configKey = key
				.slice(prefix.length)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

			const value = process.env[key];
			if (value !== undefined) {
				try {
					config[configKey] = JSON.parse(value);
				} catch {
					config[configKey] = value;
				}
			}
		}
	}

	return config as Partial<T>;
};

/**
 * Load configuration from multiple sources (files, env, defaults)
 * Merges configuration layers in order: defaults → file → rc → env
 * @param options Configuration options
 * @returns Promise with loaded configuration and layers
 */
export const loadConfig = <T extends Record<string, unknown>>(
	options: ConfigOptions<T>,
): Promise<LoadedConfig<T>> => {
	const {
		name = "config",
		cwd = process.cwd(),
		configFile,
		rcFile,
		defaultConfig = {},
		envPrefix,
		extensions = DEFAULT_EXTENSIONS,
	} = options;

	return (async () => {
		const layers: ConfigLayer<T>[] = [];

		if (defaultConfig && Object.keys(defaultConfig).length > 0) {
			layers.push({
				config: defaultConfig,
				source: "defaults",
				sourceType: "default",
			});
		}

		const foundConfigFile = configFile ?? findConfigFile(cwd, name, extensions as readonly string[]);

		if (foundConfigFile) {
			try {
				const fileConfig = await loadFile<T>(resolve(cwd, foundConfigFile));
				layers.push({
					config: fileConfig,
					source: foundConfigFile,
					sourceType: "file",
				});
			} catch (error) {
				throw configError(
					`Failed to load config file: ${foundConfigFile}`,
					error,
				);
			}
		}

		const foundRcFile = rcFile ?? findRcFile(cwd, name, extensions as readonly string[]);

		if (foundRcFile && foundRcFile !== foundConfigFile) {
			try {
				const rcConfig = await loadFile<T>(resolve(cwd, foundRcFile));
				layers.push({
					config: rcConfig,
					source: foundRcFile,
					sourceType: "file",
				});
			} catch (error) {
				throw configError(`Failed to load RC file: ${foundRcFile}`, error);
			}
		}

		if (envPrefix) {
			const envConfig = loadEnvConfig<T>(envPrefix);
			if (Object.keys(envConfig).length > 0) {
				layers.push({
					config: envConfig,
					source: "environment",
					sourceType: "env",
				});
			}
		}

		const mergedConfig = mergeConfigs(layers.map((layer) => layer.config)) as T;

		return {
			config: mergedConfig,
			configFile: foundConfigFile || "",
			layers,
		};
	})();
};

/**
 * Create a configuration loader with default options
 * Allows overriding defaults on each load
 * @param defaultOptions Default configuration options
 * @returns Function that loads config with optional overrides
 */
export const createConfigLoader = <T extends Record<string, unknown>>(defaultOptions: ConfigOptions<T>) =>
(
	overrideOptions?: Partial<ConfigOptions<T>>,
): Promise<LoadedConfig<T>> =>
	loadConfig({
		...defaultOptions,
		...overrideOptions,
	});
