import type { OnCleanup, WatchEffectOptions, WatchHandle, WatchOptions } from "../types/index";
import { effect, untrack } from "./effect";

const createScheduler = (flush: "sync" | "post") => {
	const queue = new Set<() => void>();
	let isRunning = false;

	const runJobs = () => {
		isRunning = true;
		for (const job of queue) {
			job();
		}
		queue.clear();
		isRunning = false;
	};

	return (job: () => void) => {
		queue.add(job);
		if (isRunning) return;

		if (flush === "post") {
			Promise.resolve().then(runJobs);
		} else {
			runJobs();
		}
	};
};

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

/**
 * Creates an effect that automatically tracks its dependencies and re-runs when they change.
 * Supports pause, resume, and manual stop.
 *
 * @param run - Function that runs when dependencies change, receives onCleanup callback
 * @param options - Options for flush timing ("sync" or "post")
 * @returns WatchHandle with stop, pause, resume methods
 *
 * @example
 * ```ts
 * const count = ref(0);
 * const handle = watchEffect(() => {
 *   console.log(count.value);
 * });
 * count.value = 5; // Logs: 5
 * handle.pause(); // Stop reacting
 * handle.resume(); // Start reacting again
 * handle.stop(); // Permanently stop
 * ```
 */
export const watchEffect = (
	run: (onCleanup: OnCleanup) => void,
	options?: WatchEffectOptions,
): WatchHandle => {
	const scheduler = createScheduler(options?.flush ?? "sync");
	let paused = false;
	let stopped = false;
	let cleanup: (() => void) | undefined;
	let skipNextRun = false;

	const execute = () => {
		if (stopped) return;
		if (paused) return;
		if (skipNextRun) {
			skipNextRun = false;
			return;
		}
		if (cleanup) cleanup();
		run((fn) => {
			cleanup = fn;
		});
	};

	const stopEffect = effect(() => {
		// When paused, use untrack to access signals without subscribing
		// This preserves existing subscriptions while paused
		if (paused) {
			untrack(() => scheduler(execute));
		} else {
			scheduler(execute);
		}
		return () => cleanup?.();
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
		if (stopped || !paused) return;
		paused = false;
		// Skip the first run after resume to avoid capturing current state
		skipNextRun = true;
	};

	return handle;
};

/**
 * Watches a reactive source and calls a callback when it changes.
 * Supports deep watching, immediate execution, and one-time execution.
 *
 * @param source - The source to watch (function or reactive value)
 * @param callback - Called when source changes with newValue, oldValue, and onCleanup
 * @param options - Watch options: flush, immediate, deep, once
 * @returns WatchHandle with stop, pause, resume methods
 *
 * @example
 * ```ts
 * const count = ref(0);
 * watch(() => count.value, (newVal, oldVal) => {
 *   console.log(`${oldVal} -> ${newVal}`);
 * });
 * count.value = 5; // Logs: "0 -> 5"
 *
 * // With immediate and once
 * watch(() => count.value, console.log, { immediate: true, once: true });
 * // Logs immediately, then stops after first change
 * ```
 */
export const watch = <T>(
	source: (() => T) | T,
	callback: (value: T, oldValue: T, onCleanup: OnCleanup) => void,
	options?: WatchOptions,
): WatchHandle => {
	const sourceIsFn = typeof source === "function";
	const sourceIsObject = !sourceIsFn && typeof source === "object" && source !== null;
	const getter: () => T = sourceIsFn ? (source as () => T) : () => source;

	const scheduler = createScheduler(options?.flush ?? "sync");
	let paused = false;
	let stopped = false;
	let initialized = false;
	let oldValue!: T;
	let pendingCleanup: (() => void) | undefined;
	let calledOnce = false;

	const deep = options?.deep ?? sourceIsObject;
	const traverseDepth = deep === true
		? Number.POSITIVE_INFINITY
		: typeof deep === "number"
		? deep
		: 0;

	const job = () => {
		if (stopped || paused) return undefined;

		const value = getter();
		if (traverseDepth > 0) {
			traverse(value, traverseDepth, new Set());
		}

		if (!initialized) {
			initialized = true;
			oldValue = value;
			if (options?.immediate) {
				scheduler(() => {
					if (pendingCleanup) pendingCleanup();
					let cleanup: (() => void) | undefined;
					callback(value, oldValue, (fn) => {
						cleanup = fn;
					});
					pendingCleanup = cleanup;
					if (options?.once) calledOnce = true;
				});
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

		if (pendingCleanup) pendingCleanup();
		pendingCleanup = undefined;

		scheduler(() => {
			let cleanup: (() => void) | undefined;
			callback(value, oldValue, (fn) => {
				cleanup = fn;
			});
			pendingCleanup = cleanup;
			oldValue = value;
		});

		if (options?.once) calledOnce = true;

		return () => {
			pendingCleanup?.();
			pendingCleanup = undefined;
		};
	};

	const stopEffect = effect(job);

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
		scheduler(job);
	};

	return handle;
};
