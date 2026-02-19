/**
 * Routing utilities - Pure functional approach
 */

import type { Route, RouteHandler, MiddlewareFunction, RouteMatch, MiddlewareChain, CacheOptions } from '../types'

// Pure function for route creation
export const createRoute = (
  method: string,
  path: string,
  handler: RouteHandler,
  middleware: MiddlewareChain = [],
  priority: number = 0,
  cache?: CacheOptions
): Route => ({
  method,
  path,
  handler,
  middleware,
  priority,
  cache: cache || undefined
})

// Path matching utilities
export const matchPath = (routePath: string, requestPath: string): Record<string, string> | null => {
  const routeSegments = routePath.split('/').filter(Boolean)
  const requestSegments = requestPath.split('/').filter(Boolean)

  if (routeSegments.length !== requestSegments.length) {
    return null
  }

  const params: Record<string, string> = {}

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i]
    const requestSegment = requestSegments[i]

    if (routeSegment.startsWith(':')) {
      const paramName = routeSegment.slice(1)
      params[paramName] = decodeURIComponent(requestSegment)
    } else if (routeSegment === '*') {
      params['*'] = requestSegment
    } else if (routeSegment !== requestSegment) {
      return null
    }
  }

  return params
}

// Route matching
export const matchRoute = (
  routes: Route[],
  method: string,
  path: string
): RouteMatch | null => {
  const sortedRoutes = [...routes].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  for (const route of sortedRoutes) {
    if (route.method !== method) continue

    const match = matchPath(route.path, path)
    if (match) {
      return {
        handler: route.handler,
        params: match,
        middleware: route.middleware || [],
        cache: route.cache,
        priority: route.priority || 0
      }
    }
  }

  return null
}

// Route priority calculation
export const calculateRoutePriority = (path: string): number => {
  let priority = 100

  const segments = path.split('/').filter(Boolean)
  for (const segment of segments) {
    if (segment.startsWith(':')) {
      priority -= 10
    } else if (segment === '*') {
      priority -= 20
    } else {
      priority += 5
    }
  }

  priority += segments.length * 2
  return priority
}

// Middleware composition
export const composeMiddleware = (
  middleware: MiddlewareChain
): MiddlewareFunction => {
  return async (req, res, final) => {
    let index = 0

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }

      index = i

      if (i >= middleware.length) {
        return final()
      }

      const fn = middleware[i]
      return fn(req, res, () => dispatch(i + 1))
    }

    return dispatch(0)
  }
}

export const applyMiddleware = async (
  req: any,
  res: any,
  middleware: MiddlewareChain,
  handler: RouteHandler
): Promise<any> => {
  const composed = composeMiddleware(middleware)

  return composed(req, res, async () => {
    return handler(req, res)
  })
}

// Route utilities
export const isRouteMatch = (match: any): match is RouteMatch => {
  return match && typeof match === 'object' && 'handler' in match && 'params' in match
}

export const getRouteInfo = (route: Route) => ({
  method: route.method,
  path: route.path,
  priority: route.priority,
  middlewareCount: route.middleware?.length || 0,
  hasCache: !!route.cache
})

export const sortRoutesByPriority = (routes: Route[]): Route[] =>
  [...routes].sort((a, b) => (b.priority || 0) - (a.priority || 0))

export const filterRoutesByMethod = (routes: Route[], method: string): Route[] =>
  routes.filter(route => route.method === method)

export const findRoutesByPath = (routes: Route[], path: string): Route[] =>
  routes.filter(route => route.path === path)

export const hasMiddleware = (route: Route): boolean =>
  Array.isArray(route.middleware) && route.middleware.length > 0

export const getMiddlewareCount = (route: Route): number =>
  hasMiddleware(route) ? route.middleware!.length : 0
