export type EffectCleanup = undefined | (() => void);

export type Signal<T> = {
	get: () => T;
	set: (next: T | ((prev: T) => T)) => void;
};

export type Computed<T> = {
	get: () => T;
};

export type ComputedRef<T> = Computed<T> & {
	readonly value: T;
};

export type WritableComputedRef<T> = Computed<T> & {
	value: T;
};

export type Ref<T> = {
	value: T;
};

export type OnCleanup = (cleanupFn: () => void) => void;

export type WatchHandle = {
	(): void;
	pause: () => void;
	resume: () => void;
	stop: () => void;
};

export type WatchEffectOptions = {
	flush?: "sync" | "post";
};

export type WatchOptions = WatchEffectOptions & {
	immediate?: boolean;
	deep?: boolean | number;
	once?: boolean;
};
