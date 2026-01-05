import { HistorySource, Action } from "../types/history";

export function createMockSource(): HistorySource {
	return {
		get location() {
			return { pathname: "/", search: "", hash: "", state: null, key: "default" };
		},
		get action(): Action {
			return Action.Pop;
		},
		push() {},
		replace() {},
		go() {},
		listen() {
			return () => {};
		},
	};
}
