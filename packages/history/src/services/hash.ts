import { Action } from "../types/history";
import type { Location, HistorySource, Listener } from "../types/history";
import { parsePath } from "../utils/path";
import { createMockSource } from "./mock";

export function createHashSource(options: { window?: Window } = {}): HistorySource {
	const { window = document.defaultView } = options;
	if (!window) {
		return createMockSource();
	}

	function getLocation(): Location {
		const path = window.location.hash.substring(1);
		const { pathname, search, hash } = parsePath(path);
		return {
			pathname: pathname || "/",
			search: search || "",
			hash: hash || "",
			state: null, // Hash history doesn't support state
			key: "default",
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
		push(path: string, _state?: unknown) {
			action = Action.Push;
			const nextHash = path.startsWith("#") ? path : `#${path}`;
			window.location.hash = nextHash;
		},
		replace(path: string, _state?: unknown) {
			action = Action.Replace;
			const i = window.location.href.indexOf("#");
			window.location.replace(
				window.location.href.slice(0, i >= 0 ? i : 0) + "#" + path,
			);
		},
		go(delta: number) {
			window.history.go(delta);
		},
		listen(listener: Listener) {
			const handleHashChange = () => {
				action = Action.Pop;
				location = getLocation();
				listener(location, action);
			};

			window.addEventListener("hashchange", handleHashChange);
			return () => {
				window.removeEventListener("hashchange", handleHashChange);
			};
		},
	};
}
