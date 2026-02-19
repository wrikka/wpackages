/**
 * Client Router - Pure functional approach
 */

import { Effect } from "effect";
import type { Location, NavigationOptions, RouteMatch, WRouteRecord } from "../../types";
import { matchRoute } from "../../utils";
// @ts-ignore - Hiding history import until module is available
// import { BrowserHistory, type HistoryManager, MemoryHistory } from "./history";

export type AnyRouteMatch = RouteMatch<WRouteRecord<any, any>>;

export interface ClientRouterState<TRouteMatch extends AnyRouteMatch> {
  readonly routes: readonly WRouteRecord<any, any>[];
  // readonly history: HistoryManager; // TODO: Implement when history module is available
  readonly location: Location;
  readonly match: TRouteMatch | null;
}

// Pure function for creating client router state
export const createClientRouterState = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  routes: TRoutes,
  // history: HistoryManager, // TODO: Implement when history module is available
  currentLocation: Location
): ClientRouterState<AnyRouteMatch> => ({
  routes,
  // history, // TODO: Implement when history module is available
  location: currentLocation,
  match: matchRoute(currentLocation.pathname, routes),
});

// Pure function for updating router state
export const updateRouterState = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>,
  newLocation: Location
): ClientRouterState<TRouteMatch> => ({
  ...state,
  location: newLocation,
  match: matchRoute(newLocation.pathname, state.routes),
});

// Pure function for navigation
export const navigate = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>,
  to: string,
  options?: NavigationOptions
): Effect.Effect<ClientRouterState<TRouteMatch>, never> =>
  Effect.sync(() => {
    const newLocation = state.history.createLocation(to, options);
    return updateRouterState(state, newLocation);
  });

// Pure function for going back
export const goBack = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): Effect.Effect<ClientRouterState<TRouteMatch>, never> =>
  Effect.sync(() => {
    const newLocation = state.history.back();
    return updateRouterState(state, newLocation);
  });

// Pure function for going forward
export const goForward = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): Effect.Effect<ClientRouterState<TRouteMatch>, never> =>
  Effect.sync(() => {
    const newLocation = state.history.forward();
    return updateRouterState(state, newLocation);
  });

// Pure function for going to specific index
export const goToIndex = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>,
  index: number
): Effect.Effect<ClientRouterState<TRouteMatch>, never> =>
  Effect.sync(() => {
    const newLocation = state.history.go(index);
    return updateRouterState(state, newLocation);
  });

// Pure function for getting current route
export const getCurrentRoute = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): TRouteMatch | null =>
  state.match;

// Pure function for getting current location
export const getCurrentLocation = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): Location =>
  state.location;

// Pure function for checking if route matches
export const isRouteMatch = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): boolean =>
  state.match !== null;

// Pure function for getting route params
export const getRouteParams = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): Readonly<Record<string, string | number | boolean>> =>
  state.match?.params || {};

// Pure function for getting route query
export const getRouteQuery = <TRouteMatch extends AnyRouteMatch>(
  state: ClientRouterState<TRouteMatch>
): Readonly<Record<string, string>> =>
  state.match?.query || {};

// Client router factory function
export const createClientRouter = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  routes: TRoutes,
  historyType: "browser" | "memory" = "browser",
  initialLocation?: string
) => {
  const history = historyType === "browser"
    ? new BrowserHistory()
    : new MemoryHistory();

  const currentLocation = initialLocation
    ? history.createLocation(initialLocation)
    : history.getCurrentLocation();

  let state = createClientRouterState(routes, history, currentLocation);

  return {
    getState: () => state,
    navigate: (to: string, options?: NavigationOptions) => {
      const newState = navigate(state, to, options);
      return Effect.runPromise(newState).then(s => { state = s; });
    },
    goBack: () => {
      const newState = goBack(state);
      return Effect.runPromise(newState).then(s => { state = s; });
    },
    goForward: () => {
      const newState = goForward(state);
      return Effect.runPromise(newState).then(s => { state = s; });
    },
    goToIndex: (index: number) => {
      const newState = goToIndex(state, index);
      return Effect.runPromise(newState).then(s => { state = s; });
    },
    getCurrentRoute: () => getCurrentRoute(state),
    getCurrentLocation: () => getCurrentLocation(state),
    isRouteMatch: () => isRouteMatch(state),
    getRouteParams: () => getRouteParams(state),
    getRouteQuery: () => getRouteQuery(state),
  };
};
