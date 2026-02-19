import type { EffectCleanup, EffectOptions, Subscriber, Unsubscriber } from "../types/index";

/** Effect scheduling modes */
type EffectMode = "sync" | "microtask" | "macrotask";

// Global state for effect scheduling
let isScheduling = false;
const pendingEffects = new Set<Subscriber>();

// Track currently running effects to prevent infinite loops
const runningEffects = new Set<Subscriber>();

// Error handling
let errorHandler: ((error: Error, effect: () => void) => void) | null = null;

export const setErrorHandler = (
	handler: (error: Error, effect: () => void) => void,
): void => {
	errorHandler = handler;
};

const runWithErrorHandling = (fn: () => void, effect: () => void): void => {
	try {
		fn();
	} catch (err) {
		if (errorHandler) {
			errorHandler(err instanceof Error ? err : new Error(String(err)), effect);
		} else {
			throw err;
		}
	}
};

// Execute all pending effects
const flushEffects = (): void => {
	if (isScheduling) return;
	isScheduling = true;

	const effects = Array.from(pendingEffects);
	pendingEffects.clear();

	for (const effect of effects) {
		if (!runningEffects.has(effect)) {
			runWithErrorHandling(effect, effect);
		}
	}

	isScheduling = false;

	if (pendingEffects.size > 0) {
		queueMicrotask(flushEffects);
	}
};

/**
 * Queues an effect to run.
 */
export const queueEffect = (effect: Subscriber, mode: EffectMode = "sync"): void => {
	if (runningEffects.has(effect)) return;

	if (mode === "sync") {
		runningEffects.add(effect);
		try {
			runWithErrorHandling(effect, effect);
		} finally {
			runningEffects.delete(effect);
		}
	} else {
		pendingEffects.add(effect);
		queueMicrotask(flushEffects);
	}
};

// Context for dependency tracking
let activeEffect: Subscriber | null = null;
let activeCleanups: (() => void)[] | null = null;

export const __internal = {
	getCurrentSubscriber: (): Subscriber | null => activeEffect,
	registerUnsubscriber: (unsub: Unsubscriber): void => {
		activeCleanups?.push(unsub);
	},
	queueEffect,
};

/**
 * Runs a function without tracking its dependencies.
 */
export const untrack = <T>(run: () => T): T => {
	const prevEffect = activeEffect;
	const prevCleanups = activeCleanups;
	activeEffect = null;
	activeCleanups = null;
	try {
		return run();
	} finally {
		activeEffect = prevEffect;
		activeCleanups = prevCleanups;
	}
};

/**
 * Batches multiple state updates.
 */
let isBatching = false;
const batchedEffects = new Set<Subscriber>();

export const batch = <T>(run: () => T): T => {
	const wasBatching = isBatching;
	isBatching = true;
	try {
		return run();
	} finally {
		if (!wasBatching) {
			isBatching = false;
			const effects = Array.from(batchedEffects);
			batchedEffects.clear();
			for (const effect of effects) {
				queueEffect(effect, "sync");
			}
		}
	}
};

/**
 * Creates a reactive effect that runs when its dependencies change.
 */
export const effect = (run: () => EffectCleanup, options: EffectOptions = {}): () => void => {
	const mode = options.mode ?? "sync";
	let cleanup: EffectCleanup;
	let isStopped = false;
	const cleanups: (() => void)[] = [];

	const execute = (): void => {
		if (isStopped) return;

		if (typeof cleanup === "function") {
			cleanup();
		}

		for (const cleanupFn of cleanups) {
			cleanupFn();
		}
		cleanups.length = 0;

		const prevEffect = activeEffect;
		const prevCleanups = activeCleanups;
		activeEffect = execute;
		activeCleanups = cleanups;

		try {
			cleanup = run();
		} catch (err) {
			if (errorHandler) {
				errorHandler(err instanceof Error ? err : new Error(String(err)), execute);
			} else {
				throw err;
			}
		} finally {
			activeEffect = prevEffect;
			activeCleanups = prevCleanups;
		}
	};

	if (mode === "sync") {
		execute();
	} else {
		queueEffect(execute, mode);
	}

	return (): void => {
		if (isStopped) return;
		isStopped = true;
		for (const cleanupFn of cleanups) {
			cleanupFn();
		}
		cleanups.length = 0;
		if (typeof cleanup === "function") {
			cleanup();
		}
	};
};
