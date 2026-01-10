import { Effect } from "effect";
import type { Location, NavigationOptions, RouteMatch, WRouteRecord } from "../types";
import { matchRoute } from "../utils";
import { BrowserHistory, MemoryHistory, type HistoryManager } from "./history";

export type RouterState = {
	readonly location: Location;
	readonly match: RouteMatch | null;
};

export type RouterListener = (state: RouterState) => void;

export class Router {
	private readonly routes: readonly WRouteRecord[];
	private readonly history: HistoryManager;
	private readonly listeners = new Set<RouterListener>();
	private currentMatch: RouteMatch | null = null;

	constructor(routes: readonly WRouteRecord[], history?: HistoryManager) {
		this.routes = routes;
		this.history = history ?? (typeof window !== "undefined" ? new BrowserHistory() : new MemoryHistory());

		this.history.listen((location: Location) => {
			this.handleLocationChange(location);
		});

		this.currentMatch = matchRoute(this.history.location.pathname, this.routes);
	}

	get state(): RouterState {
		return Object.freeze({
			location: this.history.location,
			match: this.currentMatch,
		});
	}

	listen(listener: RouterListener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	navigate(path: string, options: NavigationOptions = {}): Effect.Effect<void, never> {
		const self = this;
		return Effect.gen(function* () {
			if (options.replace) {
				yield* self.history.replace(path, options.state);
			} else {
				yield* self.history.push(path, options.state);
			}

			if (options.scroll !== false) {
				window.scrollTo(0, 0);
			}
		});
	}

	push(path: string, state?: unknown): Effect.Effect<void, never> {
		return this.navigate(path, { replace: false, state });
	}

	replace(path: string, state?: unknown): Effect.Effect<void, never> {
		return this.navigate(path, { replace: true, state });
	}

	go(delta: number): Effect.Effect<void, never> {
		return this.history.go(delta);
	}

	back(): Effect.Effect<void, never> {
		return this.history.back();
	}

	forward(): Effect.Effect<void, never> {
		return this.history.forward();
	}

	private handleLocationChange(location: Location): void {
		this.currentMatch = matchRoute(location.pathname, this.routes);
		this.notify();
	}

	private notify(): void {
		const state = this.state;
		for (const listener of this.listeners) {
			listener(state);
		}
	}
}

export const createRouter = (routes: readonly WRouteRecord[], history?: HistoryManager): Router => {
	return new Router(routes, history);
};
