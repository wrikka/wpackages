import { createConfigManager } from "@wpackages/config-manager";
import type { LogLevel } from "@wpackages/observability";
import { Context, Effect, Layer } from "effect";

// 1. Define the application config interface
export interface AppConfig extends Record<string, unknown> {
	readonly logLevel: LogLevel;
}

// 2. Create a context tag for the AppConfig
export const Config = Context.GenericTag<AppConfig>("@wpackages/program/Config");

// 3. Create the config manager with a schema
const configManager = createConfigManager<AppConfig>({
	schema: {
		logLevel: {
			type: "string",
			choices: ["debug", "info", "warn", "error"],
			default: "info",
		},
	},
});

// 4. Create a layer that provides the loaded config
const configEffect = Effect.tryPromise({
	try: async () => {
		const res = await configManager.load();
		return (res as { config: AppConfig }).config;
	},
	catch: (error) =>
		error instanceof Error
			? error
			: new Error(`Failed to load config: ${String(error)}`),
});

export const ConfigLive = Layer.effect(Config, configEffect);
