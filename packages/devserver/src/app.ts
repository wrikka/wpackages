/**
 * Application composition layer
 * Composes all services and components
 */

import type { PluginOption } from "vite";
import { createCommandPlugin } from "./components/command";
import { createDevtoolsPlugin } from "./components/devtools";
import { createIconPlugin } from "./components/icon";
import { createMarkdownPlugin } from "./components/markdown";
import { createStylePlugin } from "./components/style";
import { createDevServer } from "./services";
import type { DevServerConfig, DevServerInstance, WdevOptions } from "./types";

export const createApp = <T extends object>(
	options: WdevOptions<T> = {},
): PluginOption[] => {
	const styleOptions = options.style ?? options.styles?.unocss;

	const plugins: Array<PluginOption | null> = [
		createCommandPlugin("check", options.check),
		createCommandPlugin("deps", options.deps),
		createCommandPlugin("format", options.format),
		createCommandPlugin("lint", options.lint),
		createCommandPlugin("prepare", options.prepare),
		createIconPlugin({ ...options } as WdevOptions<T>),
		createStylePlugin({ ...options, style: styleOptions } as WdevOptions<T>),
		createMarkdownPlugin({ ...options } as WdevOptions<T>),
		options.devtools === false ? null : createDevtoolsPlugin(),
	];

	return plugins.filter(Boolean) as PluginOption[];
};

export const createDevServerApp = (
	config: Partial<DevServerConfig> = {},
): DevServerInstance => {
	return createDevServer(config);
};
