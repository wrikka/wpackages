import icons from "unplugin-icons/vite";
import type { PluginOption } from "vite";
import { defaultIconConfig } from "../config";
import type { WdevOptions } from "../types";
import { deepMerge } from "../utils";

export function createIconPlugin<T extends object>(
	options: WdevOptions<T>,
): PluginOption | null {
	if (!options.icon) {
		return null;
	}

	const iconOptions = Array.isArray(options.icon)
		? deepMerge(defaultIconConfig, {
			customCollections: {},
			collections: options.icon,
		})
		: typeof options.icon === "object"
		? deepMerge(defaultIconConfig, options.icon)
		: defaultIconConfig;

	return icons(iconOptions as any) as unknown as PluginOption;
}
