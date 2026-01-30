import type { PromptDescriptor } from "./prompt-descriptor";

export interface PluginContext {
	registerPrompt: <T, P extends object>(name: string, descriptor: PromptDescriptor<T, P>) => void;
	registerHook: (hook: string, handler: (...args: unknown[]) => unknown) => void;
	getConfig: <T>(key: string) => T | undefined;
	setConfig: <T>(key: string, value: T) => void;
}

export interface Plugin {
	name: string;
	version: string;
	init?: (context: PluginContext) => void | Promise<void>;
	destroy?: () => void | Promise<void>;
}

export interface PluginOptions {
	plugins: Plugin[];
	autoload?: boolean;
	pluginPath?: string;
}
