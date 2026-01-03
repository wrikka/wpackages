import { createConfigManager } from "@wpackages/config-manager";
import type { LogLevel } from "@wpackages/observability";
import { Effect } from "../lib/functional";

// 1. Define the application config interface
export interface AppConfig extends Record<string, unknown> {
	readonly logLevel: LogLevel;
}

// 2. Create a context tag for the AppConfig
export const Config = Effect.tag<AppConfig>("Config");

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
const configEffect = Effect.fromPromise(() =>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	configManager
		.load()
		.then((res: any) => res.config)
);

export const ConfigLive = Effect.map(configEffect, (config) => ({
	[Config.key]: config,
}));
