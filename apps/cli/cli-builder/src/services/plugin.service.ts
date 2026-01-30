import { Effect } from "effect";
import type { CliConfig, Plugin } from "../types";

// This is a placeholder for a more sophisticated plugin discovery mechanism
const PLUGINS_TO_LOAD = ["some-plugin"];

export const loadPlugins = (config: CliConfig): Effect.Effect<CliConfig, Error> =>
	Effect.reduce(PLUGINS_TO_LOAD, config, (currentConfig, pluginName) =>
		Effect.tryPromise({
			try: async () => {
				// In a real implementation, you would resolve and import the plugin package
				// For now, we'll simulate it.
				console.log(`Attempting to load plugin: ${pluginName}`);
				const plugin: Plugin = {
					name: pluginName,
					commands: [
						{
							name: `${pluginName}-command`,
							description: `A command from ${pluginName}`,
							action: () => console.log(`Executing command from ${pluginName}`),
						},
					],
				};

				return {
					...currentConfig,
					commands: [...currentConfig.commands, ...plugin.commands],
				};
			},
			catch: (error: unknown) => new Error(`Failed to load plugin ${pluginName}: ${String(error)}`),
		}));
