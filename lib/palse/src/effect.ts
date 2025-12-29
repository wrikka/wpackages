import type { EffectCleanup } from "./types";

type Subscriber = () => void;

let currentSubscriber: Subscriber | null = null;
let currentUnsubscribers: Array<() => void> | null = null;

export const __internal = {
	getCurrentSubscriber: () => currentSubscriber,
	registerUnsubscriber: (unsub: () => void) => {
		currentUnsubscribers?.push(unsub);
	},
};

export const effect = (run: () => EffectCleanup): (() => void) => {
	let cleanup: EffectCleanup;
	let stopped = false;
	let unsubscribers: Array<() => void> = [];

	const runner = () => {
		if (stopped) return;

		for (const unsub of unsubscribers) unsub();
		unsubscribers = [];

		if (typeof cleanup === "function") cleanup();

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
