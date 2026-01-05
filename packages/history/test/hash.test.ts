import { beforeAll, describe, expect, it, mock } from "bun:test";
import { Action } from "../src/types/history";
import { createHashHistory } from "../src/services/hash";

beforeAll(() => {
	let currentHash = "";
	const listeners = new Map<string, Set<() => void>>();

	const windowMock = {
		history: {
			go: mock(() => {}),
		},
		location: {
			get hash() {
				return currentHash;
			},
			set hash(newHash) {
				currentHash = newHash;
				listeners.get("hashchange")?.forEach(fn => fn());
			},
			href: "http://localhost/",
			replace: mock((url) => {
				const hashIndex = url.indexOf("#");
				currentHash = hashIndex > -1 ? url.substring(hashIndex) : "";
			}),
		},
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

describe("createHashHistory", () => {
	it("should handle push", () => {
		const history = createHashHistory();
		history.push("/test");
		expect(window.location.hash).toBe("#/test");
	});

	it("should handle replace", () => {
		const history = createHashHistory();
		history.push("/initial");
		history.replace("/replaced");
		expect(window.location.hash).toBe("#/replaced");
	});

	it("should notify listeners on hashchange", (done) => {
		const history = createHashHistory();
		const listener = mock((location, action) => {
			expect(location.pathname).toBe("/foo");
			expect(action).toBe(Action.Pop);
			done();
		});

		history.listen(listener);
		window.location.hash = "#/foo";
	});
});
