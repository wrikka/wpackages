/**
 * Router Composable - Pure functional approach
 */

import type { Router } from "./client/client-router";
import type { WRouteRecord } from "../types";

export interface RouterComposableState<TRoutes extends readonly WRouteRecord<any, any>[]> {
  readonly router: Router<TRoutes> | null;
  readonly error: Error | null;
}

// Pure function for creating router composable state
export const createRouterComposableState = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  router: Router<TRoutes> | null = null,
  error: Error | null = null
): RouterComposableState<TRoutes> => ({
  router,
  error,
});

// Pure function for setting router
export const setRouter = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>,
  router: Router<TRoutes>
): RouterComposableState<TRoutes> => ({
  ...state,
  router,
  error: null,
});

// Pure function for setting error
export const setRouterError = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>,
  error: Error
): RouterComposableState<TRoutes> => ({
  ...state,
  router: null,
  error,
});

// Pure function for clearing error
export const clearRouterError = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>
): RouterComposableState<TRoutes> => ({
  ...state,
  error: null,
});

// Pure function for getting router
export const getRouter = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>
): Router<TRoutes> | null =>
  state.router;

// Pure function for getting error
export const getRouterError = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>
): Error | null =>
  state.error;

// Pure function for checking if router is available
export const isRouterAvailable = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>
): boolean =>
  state.router !== null;

// Pure function for checking if has error
export const hasRouterError = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>
): boolean =>
  state.error !== null;

// Pure function for getting router state
export const getRouterState = <TRoutes extends readonly WRouteRecord<any, any>[]>(
  state: RouterComposableState<TRoutes>
): { router: Router<TRoutes> | null; error: Error | null } => ({
  router: state.router,
  error: state.error,
});

// Router composable factory function
export const createRouterComposable = <TRoutes extends readonly WRouteRecord<any, any>[]>() => {
  let state = createRouterComposableState<TRoutes>();

  return {
    getState: () => state,
    setRouter: (router: Router<TRoutes>) => {
      state = setRouter(state, router);
    },
    setError: (error: Error) => {
      state = setRouterError(state, error);
    },
    clearError: () => {
      state = clearRouterError(state);
    },
    getRouter: () => getRouter(state),
    getError: () => getRouterError(state),
    isAvailable: () => isRouterAvailable(state),
    hasError: () => hasRouterError(state),
    getRouterState: () => getRouterState(state),
  };
};
