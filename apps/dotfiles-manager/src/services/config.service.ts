import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Config, configSchema } from "../types";

export const CONFIG_PATH = join(homedir(), ".dotfile-manager.json");

export const ConfigService = {
	/**
	 * Load configuration from file (async)
	 */
	load: async (): Promise<Config> => {
		if (!existsSync(CONFIG_PATH)) {
			return configSchema.parse({});
		}
		const content = readFileSync(CONFIG_PATH, "utf-8");
		return configSchema.parse(JSON.parse(content));
	},

	/**
	 * Load configuration from file (sync)
	 */
	loadSync: (): Config => {
		if (!existsSync(CONFIG_PATH)) {
			return configSchema.parse({});
		}
		const content = readFileSync(CONFIG_PATH, "utf-8");
		return configSchema.parse(JSON.parse(content));
	},

	/**
	 * Save configuration to file
	 */
	save: (config: Config): void => {
		writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
	},

	/**
	 * Generate JSON schema
	 */
	generateSchema: (options?: { name?: string; target?: "jsonSchema7" | "jsonSchema2019-09" | "openApi3" }) => {
		return zodToJsonSchema(configSchema as any, {
			name: options?.name ?? "ConfigSchema",
			target: options?.target ?? "jsonSchema7",
		});
	},

	/**
	 * Get config path
	 */
	getPath: (): string => CONFIG_PATH,
};
