import type { SignalOptions, WatchOptions } from "../types";

/**
 * Default configuration for signals
 */
export const SIGNAL_DEFAULTS: SignalOptions<any> = {
	equals: (a, b) => a === b,
};

/**
 * Default configuration for watch
 */
export const WATCH_DEFAULTS: WatchOptions = {
	immediate: false,
};

/**
 * Default configuration for effects
 */
export const EFFECT_DEFAULTS = {
	autorun: true,
};

/**
 * Default configuration for resources
 */
export const RESOURCE_DEFAULTS = {
	initialValue: undefined,
};
