export type PluginStatus = "installed" | "enabled" | "disabled" | "error";

export type PluginPriority = "critical" | "high" | "normal" | "low";

export interface PluginMetadata {
	readonly id: string;
	readonly name: string;
	readonly version: string;
	readonly description: string;
	readonly author: string;
	readonly homepage?: string;
	readonly repository?: string;
	readonly license?: string;
	readonly keywords?: readonly string[];
}

export interface PluginDependency {
	readonly id: string;
	readonly version: string;
	readonly optional?: boolean;
}

export interface PluginCapabilities {
	readonly hotReload?: boolean;
	readonly sandboxed?: boolean;
	readonly priority?: PluginPriority;
}

export interface PluginHooks {
	readonly onInstall?: () => Promise<void>;
	readonly onEnable?: () => Promise<void>;
	readonly onDisable?: () => Promise<void>;
	readonly onUninstall?: () => Promise<void>;
	readonly onUpdate?: (oldVersion: string) => Promise<void>;
}

export interface PluginAPI {
	readonly register: (name: string, handler: unknown) => void;
	readonly unregister: (name: string) => void;
	readonly emit: (event: string, data?: unknown) => void;
	readonly on: (event: string, handler: (data?: unknown) => void) => void;
}

export interface Plugin {
	readonly metadata: PluginMetadata;
	readonly dependencies?: readonly PluginDependency[];
	readonly capabilities?: PluginCapabilities;
	readonly hooks?: PluginHooks;
	readonly init: (api: PluginAPI) => Promise<void> | void;
}

import type { PluginMetrics } from "./metrics.types";

export interface PluginState {
	readonly plugin: Plugin;
	readonly status: PluginStatus;
	readonly installedAt: Date;
	readonly enabledAt?: Date;
	readonly error?: Error;
	readonly metrics?: PluginMetrics;
}

export interface PluginRegistry {
	readonly [id: string]: PluginState;
}

export interface PluginDiscoveryOptions {
	readonly paths: readonly string[];
	readonly patterns?: readonly string[];
	readonly autoLoad?: boolean;
}

export interface PluginLoadOptions {
	readonly validate?: boolean;
	readonly enableOnLoad?: boolean;
	readonly skipDependencies?: boolean;
}

export interface PluginLoggerLike {
	readonly info: (message: string, context?: Record<string, unknown>) => void;
	readonly warn: (message: string, context?: Record<string, unknown>) => void;
	readonly error: (
		message: string,
		error?: unknown,
		context?: Record<string, unknown>,
	) => void;
	readonly debug?: (message: string, context?: Record<string, unknown>) => void;
}

export interface PluginManagerConfig {
	readonly pluginDir: string;
	readonly cacheDir?: string;
	readonly maxPlugins?: number;
	readonly discoveryOptions?: PluginDiscoveryOptions;
	readonly loadOptions?: PluginLoadOptions;
	readonly allowRemote?: boolean;
	readonly logger?: PluginLoggerLike;
}
