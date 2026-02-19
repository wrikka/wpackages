/**
 * Router service - Functional approach
 */

import type {
  Request,
  Response,
  RouteHandler,
  MiddlewareFunction,
  RouteMatch,
  Route
} from '../types'
import {
  createRoute,
  matchRoute,
  calculateRoutePriority,
  applyMiddleware
} from '../lib/core'

// Router state - immutable data structure
type RouterState = {
  routes: Record<string, Route[]>
  globalMiddleware: MiddlewareFunction[]
}

// Initial state creator
export const createRouterState = (): RouterState => ({
  routes: {},
  globalMiddleware: []
})

// Helper function for immutable Map operations
const setRoute = (routes: Record<string, Route[]>, method: string, newRoutes: Route[]): Record<string, Route[]> => ({
  ...routes,
  [method]: newRoutes
})

// Pure functions for router operations
export const addRoute = (
  state: RouterState,
  method: string,
  path: string,
  handler: RouteHandler,
  middleware: MiddlewareFunction[] = []
): RouterState => {
  const route = createRoute(method, path, handler, middleware, calculateRoutePriority(path))
  const currentRoutes = state.routes[method] || []

  return {
    ...state,
    routes: setRoute(state.routes, method, [...currentRoutes, route])
  }
}

export const addGlobalMiddleware = (
  state: RouterState,
  middleware: MiddlewareFunction[]
): RouterState => ({
  ...state,
  globalMiddleware: [...state.globalMiddleware, ...middleware]
})

export const findRoute = (
  state: RouterState,
  method: string,
  path: string
): RouteMatch | null => {
  const routes = state.routes[method] || []
  return matchRoute(routes, method, path)
}

export const handleRequest = async (
  state: RouterState,
  req: Request,
  res: Response
): Promise<void> => {
  const match = findRoute(state, req.method, req.path)

  if (!match) {
    res.status = 404
    res.body = {
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Route not found',
        requestId: req.id
      }
    }
    return
  }

  const allMiddleware = [...state.globalMiddleware, ...match.middleware]

  try {
    const result = await applyMiddleware(req, res, allMiddleware, match.handler)

    if (!res.sent) {
      res.body = result
      res.sent = true
    }
  } catch (error) {
    console.error('Failed to handle request:', error)
    res.status = 500
    res.body = {
      error: {
        code: 'ERR_INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        requestId: req.id
      }
    }
  }
}

// Router factory
export const createRouter = (): RouterState => createRouterState()

// HTTP method helpers
export const get = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'GET', path, handler, middleware)

export const post = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'POST', path, handler, middleware)

export const put = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'PUT', path, handler, middleware)

export const patch = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'PATCH', path, handler, middleware)

export const del = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'DELETE', path, handler, middleware)

export const options = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'OPTIONS', path, handler, middleware)

export const head = (
  state: RouterState,
  path: string,
  handler: RouteHandler,
  middleware?: MiddlewareFunction[]
): RouterState => addRoute(state, 'HEAD', path, handler, middleware)

// Route grouping
export const group = (
  state: RouterState,
  prefix: string,
  routes: (router: RouterState) => RouterState
): RouterState => {
  const groupRouter = routes(createRouterState())

  const newState = { ...state }

  // Merge all routes with prefix
  for (const [method, routes] of groupRouter.routes.entries()) {
    for (const route of routes) {
      const prefixedRoute = createRoute(
        method,
        prefix + route.path,
        route.handler,
        route.middleware,
        route.priority
      )

      const currentRoutes = newState.routes.get(method) || []
      const updatedRoutes = [...currentRoutes, prefixedRoute]
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))

      newState.routes.set(method, updatedRoutes)
    }
  }

  return newState
}

// Route utilities
export const getRouteStats = (state: RouterState) => {
  const stats: Record<string, any> = {
    totalRoutes: 0,
    routesByMethod: {},
    globalMiddlewareCount: state.globalMiddleware.length
  }

  for (const [method, routes] of state.routes.entries()) {
    stats.routesByMethod[method] = routes.length
    stats.totalRoutes += routes.length
  }

  return stats
}

export const validateRoutes = (state: RouterState) => {
  const errors: string[] = []

  for (const [method, routes] of state.routes.entries()) {
    for (const route of routes) {
      // Check for duplicate paths
      const duplicates = routes.filter(r => r.path === route.path && r !== route)
      if (duplicates.length > 0) {
        errors.push(`Duplicate route found: ${method} ${route.path}`)
      }

      // Check handler is function
      if (typeof route.handler !== 'function') {
        errors.push(`Invalid handler for route: ${method} ${route.path}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
