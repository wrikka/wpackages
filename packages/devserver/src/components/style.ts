import unocss from "unocss/vite";
import type { PluginOption } from "vite";
import type { WdevOptions } from "../types";

export function createStylePlugin<T extends object>(
	options: WdevOptions<T>,
): PluginOption | null {
	if (!options.style) {
		return null;
	}
	return unocss(options.style);
}
