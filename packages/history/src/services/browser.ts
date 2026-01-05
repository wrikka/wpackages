import { Action } from "../types/history";
import type { Location, HistorySource, Listener } from "../types/history";
import { createKey } from "../utils/key";
import { createPath, parsePath } from "../utils/path";
import { createMockSource } from "./mock";

export function createBrowserSource(options: { window?: Window } = {}): HistorySource {
	const { window = document.defaultView } = options;
	if (!window || !window.history) {
		return createMockSource();
	}

	const globalHistory = window.history;

	function getLocation(): Location {
		const { pathname, search, hash } = window.location;
		return {
			pathname,
			search,
			hash,
			state: globalHistory.state,
			key: (globalHistory.state as { key?: string })?.key || "default",
		};
	}

	let location = getLocation();
	let action: Action = Action.Pop;

	return {
		get location() {
			return location;
		},
		get action() {
			return action;
		},
		push(path: string, state?: unknown) {
			action = Action.Push;
			const newLocation = parsePath(path);
			const key = createKey();
			globalHistory.pushState({ key, state }, "", createPath(newLocation));
			location = getLocation();
		},
		replace(path: string, state?: unknown) {
			action = Action.Replace;
			const newLocation = parsePath(path);
			const key = createKey();
			globalHistory.replaceState({ key, state }, "", createPath(newLocation));
			location = getLocation();
		},
		go(delta: number) {
			globalHistory.go(delta);
		},
		listen(listener: Listener) {
			const handlePopState = () => {
				action = Action.Pop;
				location = getLocation();
				listener(location, action);
			};

			window.addEventListener("popstate", handlePopState);
			return () => {
				window.removeEventListener("popstate", handlePopState);
			};
		},
	};
}
