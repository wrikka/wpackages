import type { RouteParam } from "../types";

export const DYNAMIC_PARAM_PATTERN = /\[([a-zA-Z_$][a-zA-Z0-9_$]*)\]/g;
export const OPTIONAL_PARAM_PATTERN = /\[\[([a-zA-Z_$][a-zA-Z0-9_$]*)\]\]/g;
export const WILDCARD_PARAM_PATTERN = /\[\.\.\.([a-zA-Z_$][a-zA-Z0-9_$]*)\]/g;
export const COLON_PARAM_PATTERN = /:([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

export const parseRouteParams = (path: string): readonly RouteParam[] => {
	const params: RouteParam[] = [];

	let match: RegExpExecArray | null;
	while ((match = OPTIONAL_PARAM_PATTERN.exec(path)) !== null) {
		const name = match[1];
		if (name) {
			params.push({ name, type: "string", optional: true });
		}
	}

	while ((match = WILDCARD_PARAM_PATTERN.exec(path)) !== null) {
		const name = match[1];
		if (name) {
			params.push({ name, type: "string", optional: false });
		}
	}

	while ((match = DYNAMIC_PARAM_PATTERN.exec(path)) !== null) {
		const name = match![1];
		if (name && !params.some((p) => p.name === name)) {
			params.push({ name, type: "string", optional: false });
		}
	}

	while ((match = COLON_PARAM_PATTERN.exec(path)) !== null) {
		const name = match![1];
		if (name && !params.some((p) => p.name === name)) {
			params.push({ name, type: "string", optional: false });
		}
	}

	return params;
};

export const pathToRegex = (path: string): RegExp => {
	let pattern = path;

	pattern = pattern.replace(OPTIONAL_PARAM_PATTERN, "(?:/(?<$1>[^/]+))?");
	pattern = pattern.replace(WILDCARD_PARAM_PATTERN, "(?<$1>.*)");
	pattern = pattern.replace(DYNAMIC_PARAM_PATTERN, "(?<$1>[^/]+)");
	pattern = pattern.replace(COLON_PARAM_PATTERN, "(?<$1>[^/]+)");
	pattern = pattern.replace(/\*\*/g, ".*");
	pattern = pattern.replace(/\*/g, "[^/]*");

	return new RegExp(`^${pattern}$`);
};

export const extractParams = (path: string, pattern: RegExp): Readonly<Record<string, string>> => {
	const match = path.match(pattern);
	if (!match || !match.groups) {
		return {};
	}
	return Object.freeze(match.groups);
};
