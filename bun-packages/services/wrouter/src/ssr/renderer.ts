import { Effect } from "effect";
import type { WRouteRecord, RouteMatch } from "../types";

export interface SSROptions {
	readonly preloadRoutes?: readonly string[];
	readonly streaming?: boolean;
}

export interface RenderContext {
	readonly request: Request;
	 readonly match: RouteMatch;
	 readonly params: Readonly<Record<string, string | number | boolean>>;
}

export interface RenderResult {
	readonly html: string;
	readonly data?: unknown;
	 readonly status?: number;
	 readonly headers?: HeadersInit;
}

export type RenderFunction = (context: RenderContext) => Effect.Effect<RenderResult, Error>;

export class SSRRenderer {
	private readonly routes: readonly WRouteRecord[];
	private readonly renderFunctions = new Map<string, RenderFunction>();
	private readonly options: SSROptions;

	constructor(routes: readonly WRouteRecord[], options: SSROptions = {}) {
		this.routes = routes;
		this.options = {
			preloadRoutes: options.preloadRoutes ?? [],
			streaming: options.streaming ?? false,
		};
	}

	registerRender(path: string, renderFn: RenderFunction): Effect.Effect<void, never> {
		return Effect.sync(() => {
			this.renderFunctions.set(path, renderFn);
		});
	}

	async render(request: Request): Promise<RenderResult> {
		const { matchRoute } = await import("../utils");
		const url = new URL(request.url);
		const pathname = url.pathname;

		const match = matchRoute(pathname, this.routes);

		if (!match) {
			return {
				html: "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>",
				status: 404,
			};
		}

		const renderFn = this.renderFunctions.get(match.route.path);

		if (!renderFn) {
			return {
				html: `<!DOCTYPE html><html><body><h1>Route: ${match.route.path}</h1></body></html>`,
				status: 200,
			};
		}

		const context: RenderContext = {
			request,
			match,
			params: match.params,
		};

		const result = await Effect.runPromise(renderFn(context));
		return result;
	}

	async renderToString(pathname: string): Promise<string> {
		const { matchRoute } = await import("../utils");
		const match = matchRoute(pathname, this.routes);

		if (!match) {
			return "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>";
		}

		const renderFn = this.renderFunctions.get(match.route.path);

		if (!renderFn) {
			return `<!DOCTYPE html><html><body><h1>Route: ${match.route.path}</h1></body></html>`;
		}

		const context: RenderContext = {
			request: new Request(`http://localhost${pathname}`),
			match,
			params: match.params,
		};

		const result = await Effect.runPromise(renderFn(context));
		return result.html;
	}

	async *renderStream(request: Request): AsyncGenerator<string, void, unknown> {
		if (!this.options.streaming) {
			const result = await this.render(request);
			yield result.html;
			return;
		}

		const { matchRoute } = await import("../utils");
		const url = new URL(request.url);
		const pathname = url.pathname;

		const match = matchRoute(pathname, this.routes);

		if (!match) {
			yield "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>";
			return;
		}

		const renderFn = this.renderFunctions.get(match.route.path);

		if (!renderFn) {
			yield `<!DOCTYPE html><html><body><h1>Route: ${match.route.path}</h1></body></html>`;
			return;
		}

		const context: RenderContext = {
			request,
			match,
			params: match.params,
		};

		const result = await Effect.runPromise(renderFn(context));
		yield result.html;
	}

	getPreloadRoutes(): readonly string[] {
		return Object.freeze([...(this.options.preloadRoutes ?? [])]);
	}
}

export const createSSRRenderer = (routes: readonly WRouteRecord[], options: SSROptions = {}) => {
	return new SSRRenderer(routes, options);
};

export const createHydrationScript = (initialData: unknown): string => {
	return `
<script>
window.__WROUTER_INITIAL_DATA__ = ${JSON.stringify(initialData)};
</script>
`;
};

export const getInitialData = (): unknown => {
	if (typeof window === "undefined") {
		return undefined;
	}
	return (window as { __WROUTER_INITIAL_DATA__?: unknown }).__WROUTER_INITIAL_DATA__;
};
