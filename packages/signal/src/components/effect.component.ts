import type { Effect, OnCleanup } from "../types";

/**
 * Pure component for managing effect execution context
 */
export function createEffectComponent(): {
	currentEffect: Effect | null;
	setCurrentEffect: (effect: Effect | null) => void;
	getCurrentEffect: () => Effect | null;
} {
	let current: Effect | null = null;

	return {
		get currentEffect() {
			return current;
		},
		setCurrentEffect: (effect: Effect | null) => {
			current = effect;
		},
		getCurrentEffect: () => current,
	};
}

/**
 * Pure component for handling effect cleanup
 */
export function createCleanupComponent(): OnCleanup {
	return (_cleanup) => {
		// This will be implemented in the effect scope
		// where we have access to currentEffect
	};
}
