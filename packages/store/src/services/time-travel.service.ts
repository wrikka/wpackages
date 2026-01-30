/**
 * Time-travel debugging for @wpackages/store
 * Tracks history of state changes and allows navigation through time
 */

import type { Store, MapStore, Listener } from "../types";

export interface HistoryEntry<T> {
	state: T;
	timestamp: number;
	action?: string;
}

export interface TimeTravelOptions {
	maxHistory?: number;
	enableActions?: boolean;
}

/**
 * Creates a time-travel enabled store
 * @param store The store to enable time-travel for
 * @param options Time-travel options
 * @returns A time-travel enabled store
 */
export function createTimeTravel<T>(
	store: Store<T>,
	options: TimeTravelOptions = {},
): Store<T> & {
	history: HistoryEntry<T>[];
	undo: () => void;
	redo: () => void;
	jumpTo: (index: number) => void;
	clearHistory: () => void;
} {
	const { maxHistory = 50 } = options;
	let history: HistoryEntry<T>[] = [];
	let currentIndex = -1;

	const timeTravelStore: Store<T> & {
		history: HistoryEntry<T>[];
		undo: () => void;
		redo: () => void;
		jumpTo: (index: number) => void;
		clearHistory: () => void;
	} = {
		get: () => {
			if (currentIndex >= 0 && currentIndex < history.length) {
				const entry = history[currentIndex];
				if (entry) {
					return entry.state;
				}
			}
			return store.get();
		},
		set: (value: T) => {
			const entry: HistoryEntry<T> = {
				state: value,
				timestamp: Date.now(),
			};

			if (currentIndex < history.length - 1) {
				history = history.slice(0, currentIndex + 1);
			}

			history.push(entry);
			currentIndex = history.length - 1;

			if (history.length > maxHistory) {
				history.shift();
				currentIndex--;
			}

			store.set(value);
		},
		subscribe: (listener: Listener<T>) => {
			return store.subscribe(listener);
		},
		history,
		undo: () => {
			if (currentIndex > 0) {
				currentIndex--;
				const entry = history[currentIndex];
				if (entry) {
					store.set(entry.state);
				}
			}
		},
		redo: () => {
			if (currentIndex < history.length - 1) {
				currentIndex++;
				const entry = history[currentIndex];
				if (entry) {
					store.set(entry.state);
				}
			}
		},
		jumpTo: (index: number) => {
			if (index >= 0 && index < history.length) {
				currentIndex = index;
				const entry = history[currentIndex];
				if (entry) {
					store.set(entry.state);
				}
			}
		},
		clearHistory: () => {
			history = [];
			currentIndex = -1;
		},
	};

	Object.defineProperty(timeTravelStore, "history", {
		get: () => [...history],
	});

	return timeTravelStore;
}

/**
 * Creates a time-travel enabled map store
 * @param store The map store to enable time-travel for
 * @param options Time-travel options
 * @returns A time-travel enabled map store
 */
export function createTimeTravelMap<T extends object>(
	store: MapStore<T>,
	options: TimeTravelOptions = {},
): MapStore<T> & {
	history: HistoryEntry<T>[];
	undo: () => void;
	redo: () => void;
	jumpTo: (index: number) => void;
	clearHistory: () => void;
} {
	const { maxHistory = 50 } = options;
	let history: HistoryEntry<T>[] = [];
	let currentIndex = -1;

	const timeTravelStore: MapStore<T> & {
		history: HistoryEntry<T>[];
		undo: () => void;
		redo: () => void;
		jumpTo: (index: number) => void;
		clearHistory: () => void;
	} = {
		get: () => {
			if (currentIndex >= 0 && currentIndex < history.length) {
				const entry = history[currentIndex];
				if (entry) {
					return entry.state;
				}
			}
			return store.get();
		},
		set: (value: T) => {
			const entry: HistoryEntry<T> = {
				state: value,
				timestamp: Date.now(),
			};

			if (currentIndex < history.length - 1) {
				history = history.slice(0, currentIndex + 1);
			}

			history.push(entry);
			currentIndex = history.length - 1;

			if (history.length > maxHistory) {
				history.shift();
				currentIndex--;
			}

			store.set(value);
		},
		setKey: store.setKey.bind(store),
		subscribe: (listener) => {
			return store.subscribe(listener);
		},
		history,
		undo: () => {
			if (currentIndex > 0) {
				currentIndex--;
				const entry = history[currentIndex];
				if (entry) {
					store.set(entry.state);
				}
			}
		},
		redo: () => {
			if (currentIndex < history.length - 1) {
				currentIndex++;
				const entry = history[currentIndex];
				if (entry) {
					store.set(entry.state);
				}
			}
		},
		jumpTo: (index: number) => {
			if (index >= 0 && index < history.length) {
				currentIndex = index;
				const entry = history[currentIndex];
				if (entry) {
					store.set(entry.state);
				}
			}
		},
		clearHistory: () => {
			history = [];
			currentIndex = -1;
		},
	};

	Object.defineProperty(timeTravelStore, "history", {
		get: () => [...history],
	});

	return timeTravelStore;
}
