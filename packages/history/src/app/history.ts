import { History, HistorySource, Listener } from "../types/history";

/**
 * Creates a history object that can be used to manage session history.
 *
 * @param {HistorySource} source The source of history events.
 * @returns {History} A history object.
 */
export function createHistory(source: HistorySource): History {
	const listeners = new Set<Listener>();
	let sourceUnlisten: (() => void) | null = null;

	/**
	 * Subscribes a listener to history changes.
	 *
	 * @param {Listener} listener The listener to subscribe.
	 * @returns {() => void} A function to unsubscribe the listener.
	 */
	function listen(listener: Listener): () => void {
		if (listeners.size === 0) {
			sourceUnlisten = source.listen((location, action) => {
				listeners.forEach(l => l(location, action));
			});
		}

		listeners.add(listener);

		return () => {
			listeners.delete(listener);

			if (listeners.size === 0 && sourceUnlisten) {
				sourceUnlisten();
				sourceUnlisten = null;
			}
		};
	}

	return {
		get location() {
			return source.location;
		},
		get action() {
			return source.action;
		},
		push: source.push,
		replace: source.replace,
		go: source.go,
		back: () => source.go(-1),
		forward: () => source.go(1),
		listen,
	};
}
