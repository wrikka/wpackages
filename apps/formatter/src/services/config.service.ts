import { Effect } from "effect";
import { createConfigManager } from "@wpackages/config-manager";
import type { FormatOptions } from "../types";

export interface FormatterConfig {
	readonly defaultEngine: "dprint" | "biome";
	readonly check: boolean;
	readonly paths: readonly string[];
}

const formatterConfigSchema = {
	defaultEngine: {
		type: "string" as const,
		choices: ["dprint", "biome"] as const,
		required: false,
		default: "dprint",
	},
	check: {
		type: "boolean" as const,
		required: false,
		default: false,
	},
	paths: {
		type: "array" as const,
		required: false,
		default: ["."],
	},
};

export const loadConfig = (_cwd?: string): Effect.Effect<FormatterConfig, Error> =>
	Effect.tryPromise({
		try: async () => {
			const configManager = createConfigManager<FormatterConfig>({
				schema: formatterConfigSchema,
			});

			const { config } = await configManager.load();
			return config;
		},
		catch: (_error) => {
			// Return default config if loading fails
			return {
				defaultEngine: "dprint",
				check: false,
				paths: ["."],
			} as FormatterConfig;
		},
	});

export const mergeConfig = (
	cliOptions: FormatOptions,
	fileConfig: FormatterConfig,
): FormatOptions => ({
	...cliOptions,
	engine: cliOptions.engine ?? fileConfig.defaultEngine,
	check: cliOptions.check ?? fileConfig.check,
	paths: cliOptions.paths ?? fileConfig.paths,
});
