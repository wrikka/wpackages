/**
 * Server Router - Pure functional approach
 */

import type { WRouteRecord, RouteHandler } from "../types";
import { matchRoute } from "../utils";
import * as Effect from "effect";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
export type RouteHandlers = Partial<Record<HttpMethod, RouteHandler>>;

export interface ServerRouterState {
  readonly routes: readonly WRouteRecord[];
  readonly handlers: ReadonlyMap<string, RouteHandlers>;
}

// Pure function for creating server router state
export const createServerRouterState = (
  routes: readonly WRouteRecord[]
): ServerRouterState => ({
  routes,
  handlers: new Map(),
});

// Pure function for adding route
export const addRoute = (
  state: ServerRouterState,
  path: string,
  handlers: RouteHandlers
): ServerRouterState => ({
  ...state,
  handlers: new Map(state.handlers).set(path, handlers),
});

// Pure function for adding multiple routes
export const addRoutes = (
  state: ServerRouterState,
  routeMap: Readonly<Record<string, RouteHandlers>>
): ServerRouterState => {
  const newHandlers = new Map(state.handlers);
  
  for (const [path, handlers] of Object.entries(routeMap)) {
    newHandlers.set(path, handlers);
  }
  
  return {
    ...state,
    handlers: newHandlers,
  };
};

// Pure function for handling request
export const handleRequest = async (
  state: ServerRouterState,
  request: Request
): Promise<Response> => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = matchRoute(pathname, state.routes);

  if (!match) {
    return new Response("Not Found", { status: 404 });
  }

  const routeHandlers = state.handlers.get(match.route.path);

  if (!routeHandlers) {
    return new Response("No handlers found", { status: 500 });
  }

  const handler = routeHandlers[request.method as HttpMethod];

  if (!handler) {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const result = await handler(request, match.params);
    
    if (result instanceof Response) {
      return result;
    }
    
    return new Response(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Route handler error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// Pure function for getting all routes
export const getAllRoutes = (
  state: ServerRouterState
): readonly WRouteRecord[] => 
  Object.freeze([...state.routes]);

// Pure function for getting handlers by path
export const getHandlersByPath = (
  state: ServerRouterState,
  path: string
): RouteHandlers | undefined => 
  state.handlers.get(path);

// Pure function for checking if route exists
export const hasRoute = (
  state: ServerRouterState,
  path: string
): boolean => 
  state.handlers.has(path);

// Server router factory function
export const createServerRouter = (routes: readonly WRouteRecord[]) => {
  let state = createServerRouterState(routes);
  
  return {
    addRoute: (path: string, handlers: RouteHandlers) => {
      state = addRoute(state, path, handlers);
      return Effect.sync(() => {});
    },
    addRoutes: (routeMap: Readonly<Record<string, RouteHandlers>>) => {
      state = addRoutes(state, routeMap);
      return Effect.sync(() => {});
    },
    handleRequest: (request: Request) => handleRequest(state, request),
    getAllRoutes: () => getAllRoutes(state),
    getHandlersByPath: (path: string) => getHandlersByPath(state, path),
    hasRoute: (path: string) => hasRoute(state, path),
  };
};
