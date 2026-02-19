/**
 * Test utilities - Pure functional approach
 */

import type { WRouteRecord, RouteMatch, Location } from "../types";
import { matchRoute } from "../utils";

export interface TestRouterState {
  readonly routes: readonly WRouteRecord[];
  readonly base: string;
}

// Pure function for creating test router state
export const createTestRouterState = (options: {
  readonly routes: readonly WRouteRecord[];
  readonly base?: string;
}): TestRouterState => ({
  routes: options.routes,
  base: options.base ?? ""
});

// Pure function for matching routes
export const matchTestRoute = (
  state: TestRouterState,
  pathname: string
): RouteMatch | null => {
  const fullPath = state.base + pathname;
  return matchRoute(fullPath, state.routes);
};

// Pure function for navigation
export const navigateTest = (
  state: TestRouterState,
  pathname: string,
  options?: { replace?: boolean; state?: unknown }
): Location => {
  const fullPath = state.base + pathname;
  const queryIndex = pathname.indexOf("?");
  const hashIndex = pathname.indexOf("#");

  let search = "";
  let hash = "";
  let pathWithoutQuery = pathname;

  if (queryIndex !== -1) {
    search = pathname.slice(queryIndex);
    pathWithoutQuery = pathname.slice(0, queryIndex);
  }

  if (hashIndex !== -1) {
    hash = pathname.slice(hashIndex);
    if (queryIndex === -1) {
      pathWithoutQuery = pathname.slice(0, hashIndex);
    }
  }

  return Object.freeze({
    pathname: fullPath,
    search,
    hash,
    state: options?.state,
  });
};

// Pure function for creating mock request
export const createMockRequest = (
  state: TestRouterState,
  pathname: string,
  method: string = "GET"
): Request => {
  const url = `http://localhost${state.base}${pathname}`;
  return new Request(url, { method });
};

// Pure assertion functions
export const assertRouteExists = (
  state: TestRouterState,
  pathname: string
): void => {
  const match = matchTestRoute(state, pathname);
  if (!match) {
    throw new Error(`Route not found: ${pathname}`);
  }
};

export const assertRouteNotExists = (
  state: TestRouterState,
  pathname: string
): void => {
  const match = matchTestRoute(state, pathname);
  if (match) {
    throw new Error(`Route should not exist: ${pathname}`);
  }
};

export const assertRouteParams = (
  state: TestRouterState,
  pathname: string,
  expectedParams: Record<string, string | number | boolean>
): void => {
  const match = matchTestRoute(state, pathname);
  if (!match) {
    throw new Error(`Route not found: ${pathname}`);
  }

  for (const [key, value] of Object.entries(expectedParams)) {
    if (match.params[key] !== value) {
      throw new Error(`Expected param ${key} to be ${value}, got ${match.params[key]}`);
    }
  }
};

// Pure utility functions
export const getAllRoutes = (
  state: TestRouterState
): readonly WRouteRecord[] => 
  Object.freeze([...state.routes]);

export const getRouteByPath = (
  state: TestRouterState,
  path: string
): WRouteRecord | undefined => 
  state.routes.find((route) => route.path === path);

// Mock location utility
export const mockLocation = (
  pathname: string,
  search?: string,
  hash?: string
): Location => 
  Object.freeze({
    pathname,
    search: search ?? "",
    hash: hash ?? "",
    state: undefined,
  });

// Test router factory function
export const createTestRouter = (options: {
  readonly routes: readonly WRouteRecord[];
  readonly base?: string;
}) => {
  const state = createTestRouterState(options);
  
  return {
    match: (pathname: string) => matchTestRoute(state, pathname),
    navigate: (pathname: string, opts?: { replace?: boolean; state?: unknown }) => 
      navigateTest(state, pathname, opts),
    createMockRequest: (pathname: string, method?: string) => 
      createMockRequest(state, pathname, method),
    assertRouteExists: (pathname: string) => assertRouteExists(state, pathname),
    assertRouteNotExists: (pathname: string) => assertRouteNotExists(state, pathname),
    assertRouteParams: (pathname: string, params: Record<string, string | number | boolean>) => 
      assertRouteParams(state, pathname, params),
    getAllRoutes: () => getAllRoutes(state),
    getRouteByPath: (path: string) => getRouteByPath(state, path),
  };
};
