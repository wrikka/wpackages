import type { Accessor, EffectCleanup, WatchOptions } from "../types";
import { createEffect } from "./effect.scope";

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
): () => U {
	let prevValue: T | T[] | undefined;
	let value: T | T[];

	const deferFn = () => {
		if (Array.isArray(deps)) {
			value = deps.map(d => d());
		} else {
			value = deps();
		}
		const res = untrack(() => fn(value as T | T[], prevValue));
		prevValue = value;
		return res;
	};

	return deferFn;
}

function untrack<T>(fn: () => T): T {
	return fn();
}
