import type { EffectCleanup } from "../types/index";

type Subscriber = () => void;

let currentSubscriber: Subscriber | null = null;
let currentUnsubscribers: Array<() => void> | null = null;

const effectQueue = new Set<() => void>();
let isBatching = false;

export const queueEffect = (effect: () => void) => {
	if (isBatching) {
		effectQueue.add(effect);
	} else {
		effect();
	}
};

const flushQueue = () => {
	for (const effect of effectQueue) {
		effect();
	}
	effectQueue.clear();
};

export const batch = <T>(run: () => T): T => {
	const wasBatching = isBatching;
	isBatching = true;
	try {
		return run();
	} finally {
		if (!wasBatching) {
			flushQueue();
			isBatching = false;
		}
	}
};

export const __internal = {
	getCurrentSubscriber: () => currentSubscriber,
	registerUnsubscriber: (unsub: () => void) => {
		currentUnsubscribers?.push(unsub);
	},
};

export const untrack = <T>(run: () => T): T => {
	const prevSubscriber = currentSubscriber;
	currentSubscriber = null;
	try {
		return run();
	} finally {
		currentSubscriber = prevSubscriber;
	}
};

export const effect = (run: () => EffectCleanup): () => void => {
	let cleanup: EffectCleanup;
	let stopped = false;
	let unsubscribers: Array<() => void> = [];

	const runner = () => {
		if (stopped) return;

		if (typeof cleanup === "function") cleanup();
		for (const unsub of unsubscribers) unsub();
		unsubscribers = [];

		const prevSubscriber = currentSubscriber;
		const prevUnsubscribers = currentUnsubscribers;
		currentSubscriber = runner;
		currentUnsubscribers = unsubscribers;

		try {
			cleanup = run();
		} finally {
			currentSubscriber = prevSubscriber;
			currentUnsubscribers = prevUnsubscribers;
		}
	};

	runner();

	return () => {
		if (stopped) return;
		stopped = true;
		for (const unsub of unsubscribers) unsub();
		unsubscribers = [];
		if (typeof cleanup === "function") cleanup();
	};
};
