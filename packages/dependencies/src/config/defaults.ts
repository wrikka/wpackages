import type { AddOptions, InstallOptions, RemoveOptions, RunOptions, UpdateOptions } from "../types/index";

/**
 * Default install options
 */
export const DEFAULT_INSTALL_OPTIONS: Readonly<Partial<InstallOptions>> = {
	frozen: false,
	production: false,
	silent: false,
} as const;

/**
 * Default add options
 */
export const DEFAULT_ADD_OPTIONS: Readonly<Partial<AddOptions>> = {
	type: "dependencies",
	exact: false,
	global: false,
	silent: false,
} as const;

/**
 * Default remove options
 */
export const DEFAULT_REMOVE_OPTIONS: Readonly<Partial<RemoveOptions>> = {
	global: false,
	silent: false,
} as const;

/**
 * Default update options
 */
export const DEFAULT_UPDATE_OPTIONS: Readonly<Partial<UpdateOptions>> = {
	mode: "minor",
	interactive: false,
	silent: false,
} as const;

/**
 * Default run options
 */
export const DEFAULT_RUN_OPTIONS: Readonly<Partial<RunOptions>> = {
	args: [],
	silent: false,
} as const;

/**
 * Merge options with defaults
 */
export function mergeWithDefaults<T extends Record<string, unknown>>(
	options: Partial<T>,
	defaults: Readonly<Partial<T>>,
): T {
	return { ...defaults, ...options } as T;
}
