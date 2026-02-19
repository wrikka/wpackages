import { Effect } from "effect";
import type { Location, NavigationOptions, RouteMatch, WRouteRecord } from "../types";
import { matchRoute } from "../utils";
// @ts-ignore - Hiding error until history module is located
import { BrowserHistory, type HistoryManager, MemoryHistory } from "./history";

export type AnyRouteMatch = RouteMatch<WRouteRecord<any, any>>;

export type RouterState<TRouteMatch extends AnyRouteMatch> = {
	readonly location: Location;
	readonly match: TRouteMatch | null;
};

export type RouterListener<TRouteMatch extends AnyRouteMatch> = (
	state: RouterState<TRouteMatch>,
) => void;

export class Router<TRoutes extends readonly WRouteRecord<any, any>[]> {
	private readonly routes: TRoutes;
	private readonly history: HistoryManager;
	private readonly listeners = new Set<RouterListener<RouteMatch<TRoutes[number]>>>();
	private currentMatch: RouteMatch<TRoutes[number]> | null = null;

	constructor(routes: TRoutes, history?: HistoryManager) {
		this.routes = routes;
		// @ts-ignore - Hiding error until history module is located
		this.history = history
			?? (typeof window !== "undefined" ? new BrowserHistory() : new MemoryHistory());

		this.history.listen((location: Location) => {
			this.handleLocationChange(location);
		});

		this.currentMatch = matchRoute(this.history.location.pathname, this.routes);
	}

	get state(): RouterState<RouteMatch<TRoutes[number]>> {
		return Object.freeze({
			location: this.history.location,
			match: this.currentMatch,
		});
	}

	listen(listener: RouterListener<RouteMatch<TRoutes[number]>>): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	navigate(
		path: string,
		options: NavigationOptions = {},
	): Effect.Effect<void, never> {
		const historyEffect = options.replace
			? this.history.replace(path, options.state)
			: this.history.push(path, options.state);

		return Effect.orDie(historyEffect).pipe(
			Effect.tap(() => {
				if (options.scroll !== false && typeof window !== "undefined") {
					window.scrollTo(0, 0);
				}
			}),
		);
	}

	push(path: string, state?: unknown): Effect.Effect<void, never> {
		return this.navigate(path, { replace: false, state });
	}

	replace(path: string, state?: unknown): Effect.Effect<void, never> {
		return this.navigate(path, { replace: true, state });
	}

	go(delta: number): Effect.Effect<void, never> {
		return Effect.orDie(this.history.go(delta));
	}

	back(): Effect.Effect<void, never> {
		return Effect.orDie(this.history.back());
	}

	forward(): Effect.Effect<void, never> {
		return Effect.orDie(this.history.forward());
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

export const createRouter = <TRoutes extends readonly WRouteRecord<any, any>[]>(
	routes: TRoutes,
	history?: HistoryManager,
): Router<TRoutes> => {
	return new Router(routes, history);
};
