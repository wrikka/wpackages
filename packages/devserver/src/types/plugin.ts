/**
 * Core plugin API for @wpackages/devserver
 * No Vite coupling - pure devserver plugin system
 */

import type { DevServerContext } from "./ws";

export interface DevServerPlugin {
	readonly name: string;
	readonly version?: string;
	readonly description?: string;
}

export interface ResolveIdHook {
	readonly id: string;
	readonly importer?: string;
	readonly resolveId: (id: string, importer?: string) => Promise<string | null>;
}

export interface LoadHook {
	readonly id: string;
	readonly load: (id: string) => Promise<string | null>;
}

export interface TransformHook {
	readonly id: string;
	readonly code: string;
	readonly transform: (code: string, id: string) => Promise<{ code: string; map?: string }>;
}

export interface ConfigureServerHook {
	readonly context: DevServerContext;
	readonly configureServer: (context: DevServerContext) => void | Promise<void>;
}

export type DevServerPluginHook =
	| ResolveIdHook
	| LoadHook
	| TransformHook
	| ConfigureServerHook;

export interface DevServerPluginInstance extends DevServerPlugin {
	readonly hooks: Partial<{
		readonly resolveId: (id: string, importer?: string) => Promise<string | null>;
		readonly load: (id: string) => Promise<string | null>;
		readonly transform: (code: string, id: string) => Promise<{ code: string; map?: string }>;
		readonly configureServer: (context: DevServerContext) => void | Promise<void>;
	}>;
}

export interface DevServerPluginManager {
	readonly add: (plugin: DevServerPluginInstance) => void;
	readonly remove: (name: string) => void;
	readonly get: (name: string) => DevServerPluginInstance | undefined;
	readonly getAll: () => readonly DevServerPluginInstance[];
	readonly executeHook: <T extends DevServerPluginHook>(hook: T) => Promise<unknown>;
}
