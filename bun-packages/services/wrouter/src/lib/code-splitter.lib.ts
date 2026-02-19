/**
 * Route Code Splitter - Pure functional approach
 */

export interface LazyRouteOptions {
  readonly preload?: boolean;
  readonly prefetch?: boolean;
}

export type LazyRouteComponent = () => Promise<unknown>;

export interface LazyRoute {
  readonly path: string;
  readonly component: LazyRouteComponent;
  readonly options: LazyRouteOptions;
}

export interface CodeSplitterState {
  readonly lazyRoutes: ReadonlyMap<string, LazyRoute>;
  readonly loadedModules: ReadonlyMap<string, unknown>;
}

// Pure function for creating code splitter state
export const createCodeSplitterState = (): CodeSplitterState => ({
  lazyRoutes: new Map(),
  loadedModules: new Map(),
});

// Pure function for registering lazy route
export const registerLazyRoute = (
  state: CodeSplitterState,
  path: string,
  component: LazyRouteComponent,
  options: LazyRouteOptions = {}
): CodeSplitterState => ({
  ...state,
  lazyRoutes: new Map(state.lazyRoutes).set(path, { path, component, options }),
});

// Pure function for loading lazy route
export const loadLazyRoute = async (
  state: CodeSplitterState,
  path: string
): Promise<{ state: CodeSplitterState; module: unknown }> => {
  const lazyRoute = state.lazyRoutes.get(path);
  
  if (!lazyRoute) {
    throw new Error(`Lazy route not found: ${path}`);
  }

  const existingModule = state.loadedModules.get(path);
  if (existingModule !== undefined) {
    return { state, module: existingModule };
  }

  try {
    const module = await lazyRoute.component();
    const newState = {
      ...state,
      loadedModules: new Map(state.loadedModules).set(path, module),
    };
    
    return { state: newState, module };
  } catch (error) {
    throw new Error(`Failed to load lazy route ${path}: ${error}`);
  }
};

// Pure function for preloading lazy route
export const preloadLazyRoute = async (
  state: CodeSplitterState,
  path: string
): Promise<CodeSplitterState> => {
  const lazyRoute = state.lazyRoutes.get(path);
  
  if (!lazyRoute || !lazyRoute.options.preload) {
    return state;
  }

  try {
    await loadLazyRoute(state, path);
    return state;
  } catch (error) {
    console.warn(`Failed to preload lazy route ${path}:`, error);
    return state;
  }
};

// Pure function for prefetching lazy route
export const prefetchLazyRoute = async (
  state: CodeSplitterState,
  path: string
): Promise<CodeSplitterState> => {
  const lazyRoute = state.lazyRoutes.get(path);
  
  if (!lazyRoute || !lazyRoute.options.prefetch) {
    return state;
  }

  try {
    await loadLazyRoute(state, path);
    return state;
  } catch (error) {
    console.warn(`Failed to prefetch lazy route ${path}:`, error);
    return state;
  }
};

// Pure function for preloading all lazy routes
export const preloadAllLazyRoutes = async (
  state: CodeSplitterState
): Promise<CodeSplitterState> => {
  let currentState = state;
  
  for (const [path, lazyRoute] of state.lazyRoutes.entries()) {
    if (lazyRoute.options.preload) {
      currentState = await preloadLazyRoute(currentState, path);
    }
  }
  
  return currentState;
};

// Pure function for checking if route is loaded
export const isRouteLoaded = (
  state: CodeSplitterState,
  path: string
): boolean => 
  state.loadedModules.has(path);

// Pure function for checking if route is lazy
export const isLazyRoute = (
  state: CodeSplitterState,
  path: string
): boolean => 
  state.lazyRoutes.has(path);

// Pure function for getting lazy route options
export const getLazyRouteOptions = (
  state: CodeSplitterState,
  path: string
): LazyRouteOptions | undefined => 
  state.lazyRoutes.get(path)?.options;

// Pure function for getting loaded module
export const getLoadedModule = (
  state: CodeSplitterState,
  path: string
): unknown | undefined => 
  state.loadedModules.get(path);

// Pure function for getting all lazy routes
export const getAllLazyRoutes = (
  state: CodeSplitterState
): ReadonlyMap<string, LazyRoute> => 
  state.lazyRoutes;

// Pure function for getting all loaded modules
export const getAllLoadedModules = (
  state: CodeSplitterState
): ReadonlyMap<string, unknown> => 
  state.loadedModules;

// Pure function for clearing loaded modules
export const clearLoadedModules = (
  state: CodeSplitterState
): CodeSplitterState => ({
  ...state,
  loadedModules: new Map(),
});

// Pure function for clearing specific loaded module
export const clearLoadedModule = (
  state: CodeSplitterState,
  path: string
): CodeSplitterState => {
  const newLoadedModules = new Map(state.loadedModules);
  newLoadedModules.delete(path);
  
  return {
    ...state,
    loadedModules: newLoadedModules,
  };
};

// Code splitter factory function
export const createCodeSplitter = () => {
  let state = createCodeSplitterState();
  
  return {
    getState: () => state,
    registerLazyRoute: (path: string, component: LazyRouteComponent, options?: LazyRouteOptions) => {
      state = registerLazyRoute(state, path, component, options);
    },
    loadLazyRoute: async (path: string) => {
      const result = await loadLazyRoute(state, path);
      state = result.state;
      return result.module;
    },
    preloadLazyRoute: async (path: string) => {
      state = await preloadLazyRoute(state, path);
    },
    prefetchLazyRoute: async (path: string) => {
      state = await prefetchLazyRoute(state, path);
    },
    preloadAllLazyRoutes: async () => {
      state = await preloadAllLazyRoutes(state);
    },
    isRouteLoaded: (path: string) => isRouteLoaded(state, path),
    isLazyRoute: (path: string) => isLazyRoute(state, path),
    getLazyRouteOptions: (path: string) => getLazyRouteOptions(state, path),
    getLoadedModule: (path: string) => getLoadedModule(state, path),
    getAllLazyRoutes: () => getAllLazyRoutes(state),
    getAllLoadedModules: () => getAllLoadedModules(state),
    clearLoadedModules: () => {
      state = clearLoadedModules(state);
    },
    clearLoadedModule: (path: string) => {
      state = clearLoadedModule(state, path);
    },
  };
};
