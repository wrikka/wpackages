import { writeFileSync } from "fs";
import { resolve } from "path";

/**
 * Write configuration file at build time.
 * Generates config files from environment variables or other build-time data.
 *
 * @param filePath - Relative path to the config file to write
 * @param config - Configuration object to write
 * @param options - Write options
 * @returns Confirmation message
 * @throws Error if file cannot be written
 *
 * @example
 * // writeConfig("./generated/config.json", {
 * //   version: env("APP_VERSION"),
 * //   buildTime: new Date().toISOString()
 * // })
 */
export const writeConfig = Bun.macro((
	filePath: string,
	config: Record<string, unknown>,
	options: WriteConfigOptions = {},
) => {
	const absolutePath = resolve(import.meta.dir, "..", filePath);

	try {
		const content = options.format === "json"
			? JSON.stringify(config, null, options.indent || 2)
			: JSON.stringify(config);

		writeFileSync(absolutePath, content, "utf-8");

		return JSON.stringify(`Config file written to ${filePath}`);
	} catch (error) {
		throw new Error(
			"Failed to write config file at \"" + absolutePath + "\": "
				+ (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Write configuration options.
 */
interface WriteConfigOptions {
	format?: "json" | "compact";
	indent?: number;
}

/**
 * Write multiple configuration files at build time.
 *
 * @param configs - Array of config file definitions
 * @returns Confirmation message
 * @throws Error if any file cannot be written
 *
 * @example
 * // writeConfigs([
 * //   { path: "./config/app.json", data: { name: "MyApp" } },
 * //   { path: "./config/env.json", data: { env: process.env.NODE_ENV } }
 * // ])
 */
export const writeConfigs = Bun.macro((
	configs: ConfigFileDefinition[],
) => {
	const results: string[] = [];

	for (const config of configs) {
		const absolutePath = resolve(import.meta.dir, "..", config.path);

		try {
			const content = config.format === "json"
				? JSON.stringify(config.data, null, config.indent || 2)
				: JSON.stringify(config.data);

			writeFileSync(absolutePath, content, "utf-8");
			results.push(`Config file written to ${config.path}`);
		} catch (error) {
			throw new Error(
				"Failed to write config file at \"" + absolutePath + "\": "
					+ (error instanceof Error ? error.message : String(error)),
			);
		}
	}

	return JSON.stringify(results);
});

/**
 * Config file definition.
 */
interface ConfigFileDefinition {
	path: string;
	data: Record<string, unknown>;
	format?: "json" | "compact";
	indent?: number;
}
