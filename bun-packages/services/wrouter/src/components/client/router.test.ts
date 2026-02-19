import { describe, expect, it } from "vitest";
import { Effect } from "effect";
import { Router, MemoryHistory } from "./router";
import type { WRouteRecord } from "../types";

describe("Router", () => {
	it("creates router with routes", () => {
		const routes: WRouteRecord[] = [
			{ path: "/", file: "/index.ts", name: "index", params: [], methods: ["GET"] },
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const history = new MemoryHistory(["/"]);
		const router = new Router(routes, history);

		expect(router.state.location.pathname).toBe("/");
	});

	it("navigates to new path", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const history = new MemoryHistory(["/"]);
		const router = new Router(routes, history);

		Effect.runSync(router.navigate("/users"));
		expect(router.state.location.pathname).toBe("/users");
	});

	it("matches routes", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users/[id]", file: "/users/[id].ts", name: "users-id", params: [{ name: "id", type: "string", optional: false }], methods: ["GET"] },
		];

		const history = new MemoryHistory(["/"]);
		const router = new Router(routes, history);

		Effect.runSync(router.navigate("/users/123"));
		expect(router.state.match?.route.path).toBe("/users/[id]");
		expect(router.state.match?.params).toEqual({ id: "123" });
	});

	it("notifies listeners on navigation", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const history = new MemoryHistory(["/"]);
		const router = new Router(routes, history);

		let notified = false;
		router.listen(() => {
			notified = true;
		});

		Effect.runSync(router.navigate("/users"));
		expect(notified).toBe(true);
	});

	it("goes back", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const history = new MemoryHistory(["/"]);
		const router = new Router(routes, history);

		Effect.runSync(router.navigate("/users"));
		Effect.runSync(router.navigate("/posts"));
		Effect.runSync(router.back());
		expect(router.state.location.pathname).toBe("/users");
	});

	it("goes forward", () => {
		const routes: WRouteRecord[] = [
			{ path: "/users", file: "/users.ts", name: "users", params: [], methods: ["GET"] },
		];

		const history = new MemoryHistory(["/"]);
		const router = new Router(routes, history);

		Effect.runSync(router.navigate("/users"));
		Effect.runSync(router.navigate("/posts"));
		Effect.runSync(router.back());
		Effect.runSync(router.forward());
		expect(router.state.location.pathname).toBe("/posts");
	});
});
