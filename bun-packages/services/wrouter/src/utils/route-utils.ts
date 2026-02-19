/**
 * Route utilities - Pure functional approach
 */

import type { WRouteRecord, RouteMatch } from "../types";

// Pure function for creating URLSearchParams
export const createURLSearchParams = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return Object.freeze(result);
};

// Pure function for extracting route parameters
export const extractRouteParams = (
  path: string,
  pattern: RegExp
): Readonly<Record<string, string>> => {
  const match = path.match(pattern);

  if (!match) {
    return Object.freeze({});
  }

  const params: Record<string, string> = {};

  // Extract named groups from regex match
  const keys: string[] = [];
  const regex = /:(\w+)/g;
  let keyMatch;

  while ((keyMatch = regex.exec(pattern.source)) !== null) {
    keys.push(keyMatch[1]);
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = match[i + 1];
    if (value !== undefined) {
      params[key] = decodeURIComponent(value);
    }
  }

  return Object.freeze(params);
};

// Pure function for normalizing route path
export const normalizeRoutePath = (path: string): string => {
  return path
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/^\//, '') || '/'; // Remove leading slash but keep root as '/'
};

// Pure function for generating route name from path
export const routeNameFromPath = (path: string): string => {
  return path
    .split('/')
    .filter(segment => segment && !segment.startsWith(':') && !segment.startsWith('*'))
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('') || 'Home';
};

// Pure function for creating route pattern
export const createRoutePattern = (pattern: string): RegExp => {
  let regexPattern = pattern;

  // Replace wildcards with regex patterns
  regexPattern = regexPattern.replace(/\*\*/g, ".*");
  regexPattern = regexPattern.replace(/\*/g, "[^/]*");

  // Replace parameter placeholders with named groups
  regexPattern = regexPattern.replace(/:(\w+)/g, "([^/]+)");

  return new RegExp(`^${regexPattern}$`);
};

// Pure function for matching routes
export const matchRoutePattern = (
  pathname: string,
  route: WRouteRecord
): RouteMatch | null => {
  const pattern = createRoutePattern(route.path);
  const params = extractRouteParams(pathname, pattern);

  if (Object.keys(params).length === 0 && route.path !== pathname) {
    return null;
  }

  return {
    route,
    params,
    query: createURLSearchParams(pathname.split('?')[1] || ''),
  };
};

// Pure function for sorting routes by priority
export const sortRoutesByPriority = (
  routes: readonly WRouteRecord[]
): readonly WRouteRecord[] =>
  [...routes].sort((a, b) => (b.priority || 0) - (a.priority || 0));

// Pure function for filtering routes by method
export const filterRoutesByMethod = (
  routes: readonly WRouteRecord[],
  method: string
): readonly WRouteRecord[] =>
  routes.filter(route => route.method === method);

// Pure function for getting route metadata
export const getRouteMetadata = (route: WRouteRecord) => ({
  path: route.path,
  method: route.method,
  priority: route.priority || 0,
  hasMiddleware: Array.isArray(route.middleware) && route.middleware.length > 0,
  middlewareCount: Array.isArray(route.middleware) ? route.middleware.length : 0,
  isAsync: route.component?.constructor.name === 'AsyncFunction',
  hasComponent: !!route.component,
});

// Pure function for validating route
export const validateRoute = (route: WRouteRecord): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!route.path || typeof route.path !== 'string') {
    errors.push('Route path is required and must be a string');
  }

  if (!route.method || typeof route.method !== 'string') {
    errors.push('Route method is required and must be a string');
  }

  if (route.priority !== undefined && (typeof route.priority !== 'number' || route.priority < 0)) {
    errors.push('Route priority must be a non-negative number');
  }

  if (route.middleware && !Array.isArray(route.middleware)) {
    errors.push('Route middleware must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Pure function for creating route groups
export const createRouteGroup = (
  prefix: string,
  routes: readonly WRouteRecord[]
): readonly WRouteRecord[] =>
  routes.map(route => ({
    ...route,
    path: prefix + route.path,
  }));

// Pure function for merging route groups
export const mergeRouteGroups = (
  ...groups: readonly WRouteRecord[][]
): readonly WRouteRecord[] =>
  Object.freeze(groups.flat());

// Pure function for creating route aliases
export const createRouteAliases = (
  originalRoute: WRouteRecord,
  aliases: readonly string[]
): readonly WRouteRecord[] =>
  aliases.map(alias => ({
    ...originalRoute,
    path: alias,
  }));

// Pure function for finding routes by pattern
export const findRoutesByPattern = (
  routes: readonly WRouteRecord[],
  pattern: RegExp
): readonly WRouteRecord[] =>
  routes.filter(route => pattern.test(route.path));

// Pure function for getting route statistics
export const getRouteStatistics = (routes: readonly WRouteRecord[]) => {
  const methods = new Set<string>();
  let totalMiddleware = 0;
  let routesWithMiddleware = 0;

  for (const route of routes) {
    methods.add(route.method);

    if (Array.isArray(route.middleware)) {
      totalMiddleware += route.middleware.length;
      routesWithMiddleware++;
    }
  }

  return {
    totalRoutes: routes.length,
    uniqueMethods: Array.from(methods),
    routesWithMiddleware,
    totalMiddleware,
    averageMiddlewarePerRoute: routesWithMiddleware > 0 ? totalMiddleware / routesWithMiddleware : 0,
  };
};
