import { createRouter as createRou3Router } from "rou3";
import type { H3Router, H3EventHandler, RouteMatch } from "../types";

export function createRouter(): H3Router {
  const router = createRou3Router<RouteMatch>();

  const addRoute = (method: string, path: string, handler: H3EventHandler) => {
    try {
      (router as any).add?.(method, path, { handler, params: {} });
    } catch {
      console.warn(`Router add method not available for ${method} ${path}`);
    }
  };

  return {
    get(path: string, handler: H3EventHandler) {
      addRoute("GET", path, handler);
    },

    post(path: string, handler: H3EventHandler) {
      addRoute("POST", path, handler);
    },

    put(path: string, handler: H3EventHandler) {
      addRoute("PUT", path, handler);
    },

    delete(path: string, handler: H3EventHandler) {
      addRoute("DELETE", path, handler);
    },

    patch(path: string, handler: H3EventHandler) {
      addRoute("PATCH", path, handler);
    },

    options(path: string, handler: H3EventHandler) {
      addRoute("OPTIONS", path, handler);
    },

    use(handler: H3EventHandler) {
      addRoute("ALL", "/*", handler);
    },
  };
}

export function matchRoute(_router: H3Router, _method: string, _path: string): RouteMatch | null {
  return null;
}
