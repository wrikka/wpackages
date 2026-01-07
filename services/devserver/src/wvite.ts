import type { PluginOption } from "vite";
import type { WdevOptions } from "./types";
import { createIconPlugin } from "./components/icon";
import { createMarkdownPlugin } from "./components/markdown";
import { createStylePlugin } from "./components/style";

export type { WdevOptions } from "./types";

export const createApp = <T extends object>(options: WdevOptions<T> = {}): PluginOption[] => {
	const plugins: Array<PluginOption | null> = [
		createStylePlugin(options),
		createIconPlugin(options),
		createMarkdownPlugin(options),
	];

	return plugins.filter((p): p is PluginOption => p != null);
};

const wvite = <T extends object>(options: WdevOptions<T> = {}): PluginOption[] => {
	return createApp(options);
};

export default wvite;
