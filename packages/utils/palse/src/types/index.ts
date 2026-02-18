/** Cleanup function returned by an effect */
export type EffectCleanup = undefined | (() => void);

/** Subscriber function that runs when dependencies change */
export type Subscriber = () => void;

/** Unsubscriber function to remove a subscription */
export type Unsubscriber = () => void;

/** Options for effect creation */
export type EffectOptions = {
	/** Scheduling mode: "sync" (immediate), "microtask" (next tick), or "macrotask" (setTimeout) */
	mode?: "sync" | "microtask" | "macrotask";
};

/** Reactive signal with get/set interface */
export type Signal<T> = {
	/** Get current value and track as dependency */
	get: () => T;
	/** Set new value (or functional update) */
	set: (next: T | ((prev: T) => T)) => void;
};

/** Base computed type with getter */
export type Computed<T> = {
	/** Get computed value and track as dependency */
	get: () => T;
};

/** Read-only computed with .value accessor */
export type ComputedRef<T> = Computed<T> & {
	/** Read-only value property */
	readonly value: T;
};

/** Writable computed with .value getter/setter */
export type WritableComputedRef<T> = Computed<T> & {
	/** Read/write value property */
	value: T;
};

/** Reference type with .value property */
export type Ref<T> = {
	/** Read/write value property */
	value: T;
};

/** Cleanup registration callback */
export type OnCleanup = (cleanupFn: () => void) => void;

/** Handle returned by watch/watchEffect for control */
export type WatchHandle = {
	/** Calling the handle stops the watcher */
	(): void;
	/** Pause watching (effects stop running) */
	pause: () => void;
	/** Resume watching after pause */
	resume: () => void;
	/** Permanently stop the watcher */
	stop: () => void;
};

/** Options for watchEffect */
export type WatchEffectOptions = {
	/** When to flush: "sync" (immediate) or "post" (after render) */
	flush?: "sync" | "post";
};

/** Options for watch */
export type WatchOptions = WatchEffectOptions & {
	/** Run callback immediately with current value */
	immediate?: boolean;
	/** Deep watch: true (all levels), false (shallow), or number (depth) */
	deep?: boolean | number;
	/** Run only once then auto-stop */
	once?: boolean;
};
