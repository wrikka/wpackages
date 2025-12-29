
import { effect } from "./effect";
import { signal } from "./signal";
import type { OnCleanup, WatchEffectOptions, WatchHandle, WatchOptions } from "./types";

const traverse = (value: unknown, depth: number, seen: Set<unknown>): void => {
	if (depth <= 0) return;
	if (typeof value !== "object" || value === null) return;
	if (seen.has(value)) return;
	seen.add(value);

	if (Array.isArray(value)) {
		for (const item of value) traverse(item, depth - 1, seen);
		return;
	}

	for (const key of Object.keys(value as object)) {
		traverse((value as Record<string, unknown>)[key], depth - 1, seen);
	}
};

export const watchEffect = (
	run: (onCleanup: OnCleanup) => void,
	_options?: WatchEffectOptions,
): WatchHandle => {
	const tick = signal(0);
	let paused = false;
	let stopped = false;

	const stopEffect = effect(() => {
		tick.get();
		if (stopped || paused) return undefined;
		let cleanup: (() => void) | undefined;
		run((fn) => {
			cleanup = fn;
		});
		return () => {
			cleanup?.();
		};
	});

	const stop = () => {
		if (stopped) return;
		stopped = true;
		stopEffect();
	};

	const handle = (() => stop()) as WatchHandle;
	handle.stop = stop;
	handle.pause = () => {
		paused = true;
	};
	handle.resume = () => {
		if (stopped) return;
		paused = false;
		tick.set((n) => n + 1);
	};

	return handle;
};

export const watch = <T>(
	source: (() => T) | T,
	callback: (value: T, oldValue: T, onCleanup: OnCleanup) => void,
	options?: WatchOptions,
): WatchHandle => {
	const sourceIsFn = typeof source === "function";
	const sourceIsObject = !sourceIsFn && typeof source === "object" && source !== null;
	const getter: () => T = sourceIsFn ? (source as () => T) : () => source;

	const tick = signal(0);
	let paused = false;
	let stopped = false;
	let initialized = false;
	let oldValue!: T;
	let pendingCleanup: (() => void) | undefined;
	let calledOnce = false;

	const deep = options?.deep ?? sourceIsObject;
	const traverseDepth =
		deep === true ? Number.POSITIVE_INFINITY : typeof deep === "number" ? deep : 0;

	const stopEffect = effect(() => {
		tick.get();
		if (stopped || paused) return undefined;

		const value = getter();
		if (traverseDepth > 0) {
			traverse(value, traverseDepth, new Set());
		}

		if (!initialized) {
			initialized = true;
			oldValue = value;
			if (options?.immediate) {
				let cleanup: (() => void) | undefined;
				callback(value, oldValue, (fn) => {
					cleanup = fn;
				});
				pendingCleanup = cleanup;
				if (options?.once) calledOnce = true;
			}
			return () => {
				pendingCleanup?.();
				pendingCleanup = undefined;
			};
		}

		if (calledOnce) {
			stopped = true;
			return undefined;
		}

		if (Object.is(value, oldValue) && traverseDepth === 0) {
			return undefined;
		}

		pendingCleanup?.();
		pendingCleanup = undefined;

		let cleanup: (() => void) | undefined;
		callback(value, oldValue, (fn) => {
			cleanup = fn;
		});
		pendingCleanup = cleanup;
		oldValue = value;

		if (options?.once) calledOnce = true;

		return () => {
			pendingCleanup?.();
			pendingCleanup = undefined;
		};
	});

	const stop = () => {
		if (stopped) return;
		stopped = true;
		stopEffect();
	};

	const handle = (() => stop()) as WatchHandle;
	handle.stop = stop;
	handle.pause = () => {
		paused = true;
	};
	handle.resume = () => {
		if (stopped) return;
		paused = false;
		tick.set((n) => n + 1);
	};

	return handle;
};

