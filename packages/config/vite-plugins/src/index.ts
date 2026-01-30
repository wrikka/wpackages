import type { PluginOption } from "vite";
import { basePlugins, type BasePluginsOptions } from "./base";
import { buildPlugins, type BuildPluginsOptions } from "./build";
import { checkerPlugins, type CheckerPluginsOptions } from "./checker";
import { developmentPlugins, type DevelopmentPluginsOptions } from "./development";

export interface AllPluginsOptions {
	base?: BasePluginsOptions;
	checker?: CheckerPluginsOptions;
	development?: DevelopmentPluginsOptions;
	build?: BuildPluginsOptions;
}

export function allPlugins(options: AllPluginsOptions = {}): PluginOption[] {
	const {
		base: baseOptions,
		checker: checkerOptions,
		development: developmentOptions,
		build: buildOptions,
	} = options;

	return [
		...basePlugins(baseOptions),
		...developmentPlugins(developmentOptions),
		...buildPlugins(buildOptions),
		...checkerPlugins(checkerOptions),
	];
}

export {
	allPlugins,
	type AllPluginsOptions,
	basePlugins,
	type BasePluginsOptions,
	buildPlugins,
	type BuildPluginsOptions,
	checkerPlugins,
	type CheckerPluginsOptions,
	developmentPlugins,
	type DevelopmentPluginsOptions,
};
