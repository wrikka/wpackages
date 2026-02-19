/**
 * SSR Renderer - Pure functional approach
 */

import type { WRouteRecord, RouteMatch } from "../types";
import { matchRoute } from "../utils";
import * as Effect from "effect";

export type RenderFunction = (context: RenderContext) => Effect.Effect<RenderResult, Error>;

export interface RenderContext {
  readonly request: Request;
  readonly match: RouteMatch;
  readonly params: Readonly<Record<string, string | number | boolean>>;
}

export interface RenderResult {
  readonly html: string;
  readonly status: number;
  readonly headers: Record<string, string>;
}

export interface SSROptions {
  readonly preloadRoutes?: readonly string[];
  readonly streaming?: boolean;
}

export interface SSRRendererState {
  readonly routes: readonly WRouteRecord[];
  readonly renderFunctions: ReadonlyMap<string, RenderFunction>;
  readonly options: Required<SSROptions>;
}

// Pure function for creating SSR renderer state
export const createSSRRendererState = (
  routes: readonly WRouteRecord[],
  options: SSROptions = {}
): SSRRendererState => ({
  routes,
  renderFunctions: new Map(),
  options: {
    preloadRoutes: options.preloadRoutes ?? [],
    streaming: options.streaming ?? false,
  },
});

// Pure function for registering render function
export const registerRenderFunction = (
  state: SSRRendererState,
  path: string,
  renderFn: RenderFunction
): SSRRendererState => ({
  ...state,
  renderFunctions: new Map(state.renderFunctions).set(path, renderFn),
});

// Pure function for rendering
export const render = async (
  state: SSRRendererState,
  request: Request
): Promise<RenderResult> => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = matchRoute(pathname, state.routes);

  if (!match) {
    return {
      html: "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>",
      status: 404,
      headers: { "content-type": "text/html" },
    };
  }

  const renderFn = state.renderFunctions.get(match.route.path);

  if (!renderFn) {
    return {
      html: "<!DOCTYPE html><html><body><h1>No renderer found</h1></body></html>",
      status: 500,
      headers: { "content-type": "text/html" },
    };
  }

  const context: RenderContext = {
    request: new Request(`http://localhost${pathname}`),
    match,
    params: match.params,
  };

  try {
    return await Effect.runPromise(renderFn(context));
  } catch (error) {
    return {
      html: "<!DOCTYPE html><html><body><h1>Internal Server Error</h1></body></html>",
      status: 500,
      headers: { "content-type": "text/html" },
    };
  }
};

// Pure function for rendering to string
export const renderToString = async (
  state: SSRRendererState,
  pathname: string
): Promise<string> => {
  const match = matchRoute(pathname, state.routes);

  if (!match) {
    return "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>";
  }

  const renderFn = state.renderFunctions.get(match.route.path);

  if (!renderFn) {
    return `<!DOCTYPE html><html><body><h1>Route: ${match.route.path}</h1></body></html>`;
  }

  const context: RenderContext = {
    request: new Request(`http://localhost${pathname}`),
    match,
    params: match.params,
  };

  try {
    const result = await Effect.runPromise(renderFn(context));
    return result.html;
  } catch (error) {
    return "<!DOCTYPE html><html><body><h1>Internal Server Error</h1></body></html>";
  }
};

// Pure function for streaming render
export function renderStream(
  state: SSRRendererState,
  request: Request
): AsyncGenerator<string, void, unknown> {
  if (!state.options.streaming) {
    const result = await render(state, request);
    yield result.html;
    return;
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  const match = matchRoute(pathname, state.routes);

  if (!match) {
    yield "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>";
    return;
  }

  const renderFn = state.renderFunctions.get(match.route.path);

  if (!renderFn) {
    yield`<!DOCTYPE html><html><body><h1>Route: ${match.route.path}</h1></body></html>`;
    return;
  }

  const context: RenderContext = {
    request: new Request(`http://localhost${pathname}`),
    match,
    params: match.params,
  };

  try {
    const result = await Effect.runPromise(renderFn(context));
    yield result.html;
  } catch (error) {
    yield "<!DOCTYPE html><html><body><h1>Internal Server Error</h1></body></html>";
  }
}

// Pure utility functions
export const getPreloadRoutes = (
  state: SSRRendererState
): readonly string[] =>
  Object.freeze([...state.options.preloadRoutes]);

// SSR renderer factory function
export const createSSRRenderer = (
  routes: readonly WRouteRecord[],
  options: SSROptions = {}
) => {
  let state = createSSRRendererState(routes, options);

  return {
    registerRender: (path: string, renderFn: RenderFunction) => {
      state = registerRenderFunction(state, path, renderFn);
    },
    render: (request: Request) => render(state, request),
    renderToString: (pathname: string) => renderToString(state, pathname),
    renderStream: (request: Request) => renderStream(state, request),
    getPreloadRoutes: () => getPreloadRoutes(state),
  };
};

// Pure function for creating hydration script
export const createHydrationScript = (initialData: unknown): string => {
  const script = `
    window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};
    console.log('Hydration data loaded:', window.__INITIAL_DATA__);
  `;

  return `<script>${script}</script>`;
};
