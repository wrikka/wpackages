import type { WRouteRecord, Middleware, RouteGuard } from "../types";

export interface RouteGroup {
	readonly name: string;
	readonly prefix: string;
	readonly routes: readonly WRouteRecord[];
	readonly middleware: readonly Middleware[];
	readonly guards: readonly RouteGuard[];
	readonly metadata: Record<string, unknown>;
}

export interface RouteGroupOptions {
	readonly middleware?: readonly Middleware[];
	readonly guards?: readonly RouteGuard[];
	readonly metadata?: Record<string, unknown>;
}

export class RouteGroupManager {
	private readonly groups = new Map<string, RouteGroup>();

	registerGroup(name: string, prefix: string, routes: readonly WRouteRecord[], options: RouteGroupOptions = {}): void {
		const group: RouteGroup = Object.freeze({
			name,
			prefix,
			routes,
			middleware: options.middleware ?? [],
			guards: options.guards ?? [],
			metadata: options.metadata,
		});

		this.groups.set(name, group);
	}

	getGroup(name: string): RouteGroup | undefined {
		return this.groups.get(name);
	}

	getAllGroups(): readonly RouteGroup[] {
		return Object.freeze([...this.groups.values()]);
	}

	getRoutesByGroup(name: string): readonly WRouteRecord[] {
		const group = this.groups.get(name);
		return group?.routes ?? [];
	}

	getMiddlewareForGroup(name: string): readonly Middleware[] {
		const group = this.groups.get(name);
		return group?.middleware ?? [];
	}

	getGuardsForGroup(name: string): readonly RouteGuard[] {
		const group = this.groups.get(name);
		return group?.guards ?? [];
	}

	getMetadataForGroup(name: string): Record<string, unknown> | undefined {
		const group = this.groups.get(name);
		return group?.metadata;
	}

	findGroupByRoute(routePath: string): RouteGroup | undefined {
		for (const group of this.groups.values()) {
			if (routePath.startsWith(group.prefix)) {
				return group;
			}
		}
		return undefined;
	}

	removeGroup(name: string): void {
		this.groups.delete(name);
	}

	clear(): void {
		this.groups.clear();
	}
}

export const createRouteGroupManager = () => {
	return new RouteGroupManager();
};

export const createRouteGroup = (
	name: string,
	prefix: string,
	routes: readonly WRouteRecord[],
	options?: RouteGroupOptions,
): RouteGroup => {
	return Object.freeze({
		name,
		prefix,
		routes,
		middleware: options?.middleware ?? [],
		guards: options?.guards ?? [],
		metadata: options?.metadata,
	});
};

export const mergeRouteGroups = (...groups: readonly RouteGroup[]): readonly WRouteRecord[] => {
	const allRoutes: WRouteRecord[] = [];

	for (const group of groups) {
		for (const route of group.routes) {
			const prefixedRoute: WRouteRecord = Object.freeze({
				...route,
				path: `${group.prefix}${route.path}`.replace(/\/+/g, "/"),
			});

			allRoutes.push(prefixedRoute);
		}
	}

	return Object.freeze(allRoutes);
};
