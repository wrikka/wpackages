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

export class CodeSplitter {
	private readonly lazyRoutes = new Map<string, LazyRoute>();
	private readonly loadedModules = new Map<string, unknown>();

	registerLazyRoute(path: string, component: LazyRouteComponent, options: LazyRouteOptions = {}): void {
		this.lazyRoutes.set(path, { path, component, options });
	}

	async loadRoute(path: string): Promise<unknown> {
		const cached = this.loadedModules.get(path);
		if (cached !== undefined) {
			return cached;
		}

		const lazyRoute = this.lazyRoutes.get(path);
		if (!lazyRoute) {
			return undefined;
		}

		const loadedModule = await lazyRoute.component();
		this.loadedModules.set(path, loadedModule);
		return loadedModule;
	}

	async preloadRoute(path: string): Promise<void> {
		await this.loadRoute(path);
	}

	async preloadRoutes(paths: readonly string[]): Promise<void> {
		await Promise.all(paths.map((path) => this.preloadRoute(path)));
	}

	async prefetchRoute(path: string): Promise<void> {
		const lazyRoute = this.lazyRoutes.get(path);
		if (!lazyRoute || !lazyRoute.options.prefetch) {
			return;
		}

		await this.loadRoute(path);
	}

	isRouteLoaded(path: string): boolean {
		return this.loadedModules.has(path);
	}

	getLoadedRoutes(): readonly string[] {
		return Object.freeze([...this.loadedModules.keys()]);
	}

	clearCache(): void {
		this.loadedModules.clear();
	}
}

export const createCodeSplitter = () => {
	return new CodeSplitter();
};

export const createLazyRoute = (
	path: string,
	component: LazyRouteComponent,
	options: LazyRouteOptions = {},
): LazyRoute => {
	return Object.freeze({ path, component, options });
};

export const lazy = (importFn: () => Promise<unknown>, _options: LazyRouteOptions = {}) => {
	return importFn;
};
