import type { Effect, EffectCleanup, EffectScope, OnCleanup } from "../types";

const effectStack: Effect[] = [];
export let currentEffect: Effect | null = null;
let currentScope: EffectScope | null = null;

export function setCurrentEffect(effect: Effect | null): void {
	currentEffect = effect;
}

export function createEffect(fn: () => void): EffectCleanup {
	const effectFn: Effect = () => {
		if (effectFn.cleanup) {
			effectFn.cleanup();
		}

		const parent = currentEffect;
		currentEffect = effectFn;
		effectStack.push(effectFn);

		try {
			fn();
		} finally {
			effectStack.pop();
			currentEffect = parent;
		}
	};

	const cleanup = () => {
		if (effectFn.deps) {
			for (const dep of effectFn.deps) {
				dep.delete(effectFn as any);
			}
			effectFn.deps.clear();
		}
		if (effectFn.cleanup) {
			effectFn.cleanup();
		}
	};

	effectFn.dispose = cleanup;

	if (currentScope) {
		currentScope.effects.add(effectFn);
	}

	effectFn();

	return cleanup;
}

export function createEffectScope(_detached = false): EffectScope & { run: <T>(fn: () => T) => T } {
	const effects = new Set<Effect>();

	const dispose = () => {
		for (const effect of effects) {
			effect.dispose?.();
		}
		effects.clear();
	};

	const scope: EffectScope = {
		effects,
		dispose,
	};

	const run = <T>(fn: () => T): T => {
		const prevScope = currentScope;
		currentScope = scope;
		try {
			return fn();
		} finally {
			currentScope = prevScope;
		}
	};

	return { ...scope, run };
}

export const onCleanup: OnCleanup = (cleanup) => {
	if (currentEffect) {
		currentEffect.cleanup = cleanup;
	}
};
