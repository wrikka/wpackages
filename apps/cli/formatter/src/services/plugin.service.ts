import { Effect } from "effect";
import type { FormatterEngine } from "../types";

export interface FormatterPlugin {
	readonly name: string;
	readonly version: string;
	readonly supportedEngines: readonly FormatterEngine[];
	readonly supportedExtensions: readonly string[];
	readonly format?: (code: string, filePath: string) => Promise<string>;
}

export const loadPlugins = (_pluginDir?: string): Effect.Effect<readonly FormatterPlugin[], never> =>
	Effect.sync(() => {
		// TODO: Implement plugin loading from directory
		// For now, return empty array
		return [];
	});

export const findPluginForFile = (
	plugins: readonly FormatterPlugin[],
	filePath: string,
	engine: FormatterEngine,
): FormatterPlugin | undefined => {
	const ext = filePath.split(".").pop();
	return plugins.find((p) =>
		p.supportedEngines.includes(engine) &&
		p.supportedExtensions.includes(`.${ext}`),
	);
};