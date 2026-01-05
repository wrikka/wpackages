import { beforeAll, describe, expect, it, mock } from "bun:test";
import { Action } from "../src/types/history";
import { createBrowserHistory } from "../src/services/browser";

beforeAll(() => {
	const locationMock = {
		pathname: "/",
		search: "",
		hash: "",
	};

	const listeners = new Map<string, Set<() => void>>();

	const windowMock = {
		history: {
			pushState: mock((state, title, url) => {
				const newLocation = new URL(url, "http://localhost");
				locationMock.pathname = newLocation.pathname;
				locationMock.search = newLocation.search;
				locationMock.hash = newLocation.hash;
			}),
			replaceState: mock((state, title, url) => {
				const newLocation = new URL(url, "http://localhost");
				locationMock.pathname = newLocation.pathname;
				locationMock.search = newLocation.search;
				locationMock.hash = newLocation.hash;
			}),
			back: mock(() => {
				locationMock.pathname = "/";
				listeners.get("popstate")?.forEach(fn => fn());
			}),
			go: mock(() => {}),
			state: null,
		},
		location: locationMock,
		addEventListener: mock((event, cb) => {
			if (!listeners.has(event)) {
				listeners.set(event, new Set());
			}
			listeners.get(event)!.add(cb);
		}),
		removeEventListener: mock((event, cb) => {
			listeners.get(event)?.delete(cb);
		}),
	};
	global.window = windowMock as any;
	global.document = {
		defaultView: windowMock,
	} as any;
});

describe("createBrowserHistory", () => {
	it("should handle push", () => {
		const history = createBrowserHistory();
		history.push("/test");
		expect(window.location.pathname).toBe("/test");
	});

	it("should handle replace", () => {
		const history = createBrowserHistory();
		history.push("/initial");
		history.replace("/replaced");
		expect(window.location.pathname).toBe("/replaced");
	});

	it("should notify listeners on popstate", (done) => {
		const history = createBrowserHistory();
		const listener = mock((location, action) => {
			expect(location.pathname).toBe("/");
			expect(action).toBe(Action.Pop);
			done();
		});

		history.listen(listener);
		history.push("/foo");
		window.history.back();
	});
});
