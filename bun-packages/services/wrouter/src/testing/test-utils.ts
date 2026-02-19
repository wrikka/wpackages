import type { WRouteRecord, RouteMatch, Location } from "../types";
import { matchRoute } from "../utils";

export interface TestRouterOptions {
	readonly routes: readonly WRouteRecord[];
	readonly base?: string;
}

export class TestRouter {
	private readonly routes: readonly WRouteRecord[];
	private readonly base: string;

	constructor(options: TestRouterOptions) {
		this.routes = options.routes;
		this.base = options.base ?? "";
	}

	match(pathname: string): RouteMatch | null {
		const fullPath = this.base + pathname;
		return matchRoute(fullPath, this.routes);
	}

	navigate(pathname: string, options?: { replace?: boolean; state?: unknown }): Location {
		const fullPath = this.base + pathname;
		const queryIndex = pathname.indexOf("?");
		const hashIndex = pathname.indexOf("#");

		let search = "";
		let hash = "";
		let _pathWithoutQuery = pathname;

		if (queryIndex !== -1) {
			search = pathname.slice(queryIndex);
			_pathWithoutQuery = pathname.slice(0, queryIndex);
		}

		if (hashIndex !== -1) {
			hash = pathname.slice(hashIndex);
			if (queryIndex === -1) {
				_pathWithoutQuery = pathname.slice(0, hashIndex);
			}
		}

		return Object.freeze({
			pathname: fullPath,
			search,
			hash,
			state: options?.state,
		});
	}

	createMockRequest(pathname: string, method: string = "GET"): Request {
		const url = `http://localhost${this.base}${pathname}`;
		return new Request(url, { method });
	}

	assertRouteExists(pathname: string): asserts pathname is string {
		const match = this.match(pathname);
		if (!match) {
			throw new Error(`Route not found: ${pathname}`);
		}
	}

	assertRouteNotExists(pathname: string): void {
		const match = this.match(pathname);
		if (match) {
			throw new Error(`Route should not exist: ${pathname}`);
		}
	}

	assertRouteParams(pathname: string, expectedParams: Record<string, string | number | boolean>): void {
		const match = this.match(pathname);
		if (!match) {
			throw new Error(`Route not found: ${pathname}`);
		}

		for (const [key, value] of Object.entries(expectedParams)) {
			if (match.params[key] !== value) {
				throw new Error(`Expected param ${key} to be ${value}, got ${match.params[key]}`);
			}
		}
	}

	getAllRoutes(): readonly WRouteRecord[] {
		return Object.freeze([...this.routes]);
	}

	getRouteByPath(path: string): WRouteRecord | undefined {
		return this.routes.find((route) => route.path === path);
	}
}

export const createTestRouter = (options: TestRouterOptions) => {
	return new TestRouter(options);
};

export const mockLocation = (pathname: string, search?: string, hash?: string): Location => {
	return Object.freeze({
		pathname,
		search: search ?? "",
		hash: hash ?? "",
		state: undefined,
	});
};

export const mockRouteMatch = (path: string, params: Record<string, string | number | boolean> = {}): RouteMatch => {
	return Object.freeze({
		route: Object.freeze({
			path,
			file: "",
			name: "",
			params: [],
			methods: ["GET"] as const,
		}),
		params: Object.freeze(params),
		query: Object.freeze({}),
		hash: "",
	});
};
