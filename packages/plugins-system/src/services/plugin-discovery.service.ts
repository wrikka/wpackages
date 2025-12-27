import { glob } from "glob";
import type { Plugin, PluginDiscoveryOptions } from "../types";
import { loadPlugin } from "./plugin-loader.service";

export interface DiscoveryResult {
	readonly found: readonly string[];
	readonly loaded: readonly Plugin[];
	readonly errors: readonly { path: string; error: string }[];
}

export const discoverPlugins = async (
	options: PluginDiscoveryOptions,
): Promise<DiscoveryResult> => {
	const found: string[] = [];
	const loaded: Plugin[] = [];
	const errors: { path: string; error: string }[] = [];

	try {
		const searchPatterns = options.patterns
			? [...options.patterns]
			: ["**/*.plugin.js", "**/*.plugin.ts"];
		for (const searchPath of options.paths) {
			const plugins = await glob(searchPatterns, {
				cwd: searchPath,
				absolute: true,
			});
			found.push(...plugins);
		}

		if (options.autoLoad) {
			for (const pluginPath of found) {
				const result = await loadPlugin(pluginPath);
				if (result._tag === "Success") {
					loaded.push(result.value);
				} else {
					errors.push({
						error: result.error,
						path: pluginPath,
					});
				}
			}
		}
	} catch (error) {
		errors.push({
			error: error instanceof Error ? error.message : String(error),
			path: "discovery",
		});
	}

	return Object.freeze({
		errors: Object.freeze(errors),
		found: Object.freeze(found),
		loaded: Object.freeze(loaded),
	});
};
