import type { Effect, EffectCleanup, OnCleanup } from "../types";

export let currentEffect: Effect | null = null;

export function createEffect(fn: () => void): EffectCleanup {
	const effectFn: Effect = () => {
		if (effectFn.cleanup) {
			effectFn.cleanup();
		}
		const prevEffect = currentEffect;
		currentEffect = effectFn;
		try {
			fn();
		} finally {
			currentEffect = prevEffect;
		}
	};

	effectFn();

	return () => {
		if (effectFn.cleanup) {
			effectFn.cleanup();
		}
	};
}

export const onCleanup: OnCleanup = (cleanup) => {
	if (currentEffect) {
		currentEffect.cleanup = cleanup;
	}
};
