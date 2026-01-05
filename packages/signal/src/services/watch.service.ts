import type { Accessor, EffectCleanup, WatchOptions } from "../types";
import { createEffect, currentEffect, setCurrentEffect } from "./effect.scope";

// Watch a source and run a callback when it changes
export function watch<T>(
	source: Accessor<T>,
	callback: (value: T, prevValue: T | undefined) => void,
	_options: WatchOptions = {},
): EffectCleanup {
	const effectFn = on(source, (value, prevValue) => {
		if (_options.immediate || prevValue !== undefined) {
			callback(value as T, prevValue as T | undefined);
		}
	});
	return createEffect(effectFn);
}

// Watch multiple sources
export function watchMultiple<T extends readonly Accessor<any>[]>(
	sources: T,
	callback: (values: any[], prevValues: any[] | undefined) => void,
	_options: WatchOptions = {},
): EffectCleanup {
	const effectFn = on(sources as any, (values, prevValues) => {
		if (_options.immediate || prevValues !== undefined) {
			callback(values as any[], prevValues as any[] | undefined);
		}
	});
	return createEffect(effectFn);
}

/**
 * Creates a deferred computation that only runs when the dependencies change.
 * It helps to explicitly control the dependencies of an effect.
 */
export function on<T, U>(
	deps: Accessor<T> | Accessor<T>[],
	fn: (value: T | T[], prevValue: T | T[] | undefined) => U,
): () => U | undefined {
	let prevValue: T | T[] | undefined;
	let inited = false;

	return () => {
		const value = Array.isArray(deps) ? deps.map(d => d()) : deps();

		if (inited && value === prevValue) {
			return undefined;
		}

		const result = untrack(() => fn(value, prevValue));

		prevValue = value;
		inited = true;
		return result;
	};
}

function untrack<T>(fn: () => T): T {
	const prevEffect = currentEffect;
	setCurrentEffect(null);
	try {
		return fn();
	} finally {
		setCurrentEffect(prevEffect);
	}
}
