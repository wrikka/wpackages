import type { BaseStore } from "../types";

const activeStores = new Set<BaseStore>();

export function manageLifecycle(store: BaseStore, listeners: Set<unknown>) {
	if (listeners.size > 0 && !activeStores.has(store)) {
		activeStores.add(store);
		if (store.onMount) {
			const onUnmount = store.onMount();
			if (onUnmount) {
				store.onUnmount = onUnmount;
			}
		}
	} else if (listeners.size === 0 && activeStores.has(store)) {
		activeStores.delete(store);
		if (typeof store.onUnmount === "function") {
			store.onUnmount();
			delete store.onUnmount;
		}
	}
}

/**
 * Attaches a lifecycle callback that runs when a store gets its first subscriber.
 * This is useful for setting up resources like event listeners or intervals.
 * @param store The store to attach the lifecycle event to.
 * @param onMountCallback The function to run. It can optionally return a cleanup function that will run when the last subscriber leaves.
 */
export function onMount(store: BaseStore, onMountCallback: () => (() => void) | void) {
	store.onMount = onMountCallback;
}
