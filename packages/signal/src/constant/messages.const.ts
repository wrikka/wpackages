/**
 * Constant messages for reactivity
 */

export const REACTIVITY_MESSAGES = {
	SIGNAL_CREATED: "Signal created",
	EFFECT_REGISTERED: "Effect registered",
	EFFECT_CLEANUP: "Effect cleanup",
	RESOURCE_LOADING: "Resource loading",
	RESOURCE_ERROR: "Resource error",
} as const;

export const ERROR_MESSAGES = {
	INVALID_SIGNAL: "Invalid signal",
	INVALID_EFFECT: "Invalid effect",
	INVALID_RESOURCE: "Invalid resource",
} as const;
