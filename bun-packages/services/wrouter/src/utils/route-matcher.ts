import type { RouteMatch, WRouteRecord } from "../types";
import { pathToRegex, extractParams } from "./path-parser";

export const matchRoute = (pathname: string, routes: readonly WRouteRecord[]): RouteMatch | null => {
	for (const route of routes) {
		const pattern = pathToRegex(route.path);
		const match = pathname.match(pattern);

		if (match) {
			const params = extractParams(pathname, pattern);
			const query = extractQuery(pathname);
			const hash = extractHash(pathname);

			return Object.freeze({
				route,
				params,
				query,
				hash,
			});
		}
	}

	return null;
};

export const matchRoutes = (pathname: string, routes: readonly WRouteRecord[]): readonly RouteMatch[] => {
	const matches: RouteMatch[] = [];

	for (const route of routes) {
		const pattern = pathToRegex(route.path);
		const match = pathname.match(pattern);

		if (match) {
			const params = extractParams(pathname, pattern);
			const query = extractQuery(pathname);
			const hash = extractHash(pathname);

			matches.push(
				Object.freeze({
					route,
					params,
					query,
					hash,
				}),
			);

			if (route.children) {
				const childMatches = matchRoutes(pathname, route.children);
				matches.push(...childMatches);
			}
		}
	}

	return matches;
};

export const extractQuery = (pathname: string): Readonly<Record<string, string>> => {
	const queryIndex = pathname.indexOf("?");
	if (queryIndex === -1) {
		return {};
	}

	const queryString = pathname.slice(queryIndex + 1);
	const params = new URLSearchParams(queryString);
	const result: Record<string, string> = {};

	for (const [key, value] of params.entries()) {
		result[key] = value;
	}

	return Object.freeze(result);
};

export const extractHash = (pathname: string): string => {
	const hashIndex = pathname.indexOf("#");
	if (hashIndex === -1) {
		return "";
	}
	return pathname.slice(hashIndex);
};

export const resolvePath = (base: string, path: string): string => {
	if (path.startsWith("/")) {
		return path;
	}

	const baseParts = base.split("/").filter(Boolean);
	const pathParts = path.split("/").filter(Boolean);

	for (const part of pathParts) {
		if (part === "..") {
			baseParts.pop();
		} else if (part !== ".") {
			baseParts.push(part);
		}
	}

	return `/${baseParts.join("/")}`;
};
