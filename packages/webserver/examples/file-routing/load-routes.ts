import { readdir } from "fs/promises";
import { join, relative } from "path";
import type { RouteDefinition } from "../../src/types";

export type FileRouteModule = {
	default?: RouteDefinition;
	handler?: RouteDefinition["handler"];
	schema?: any;
};

const METHOD_SUFFIXES = ["get", "post", "put", "delete", "patch"] as const;

type MethodSuffix = (typeof METHOD_SUFFIXES)[number];

function isMethodSuffix(x: string): x is MethodSuffix {
	return (METHOD_SUFFIXES as readonly string[]).includes(x);
}

function toHttpMethod(suffix: MethodSuffix): RouteDefinition["method"] {
	return suffix.toUpperCase() as RouteDefinition["method"];
}

function toRoutePathFromSegments(segments: string[]): string {
	const parts = segments
		.filter((seg) => seg !== "index")
		.map((seg) => {
		if (seg.startsWith("[") && seg.endsWith("]")) {
			const name = seg.slice(1, -1);
			return `:${name}`;
		}
		return seg;
		});
	return `/${parts.join("/")}`.replace(/\/+/g, "/");
}

async function walk(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(full)));
			continue;
		}
		if (!entry.isFile()) {
			continue;
		}
		if (!entry.name.endsWith(".ts")) {
			continue;
		}
		files.push(full);
	}
	return files;
}

export async function loadFileRoutes(options: {
	routesRoot: string;
	importBase: string;
}): Promise<RouteDefinition[]> {
	const { routesRoot, importBase } = options;

	const files = await walk(routesRoot);
	const routes: RouteDefinition[] = [];

	for (const file of files) {
		const rel = relative(routesRoot, file).replace(/\\/g, "/");
		const segments = rel.split("/");
		const filename = segments.pop() as string;

		const nameParts = filename.replace(/\.ts$/, "").split(".");
		const last = nameParts[nameParts.length - 1];
		if (!last || !isMethodSuffix(last)) {
			continue;
		}

		const method = toHttpMethod(last);
		const routeSegments = [...segments, ...nameParts.slice(0, -1)];
		const path = toRoutePathFromSegments(routeSegments);

		const importPath = `${importBase}/${rel}`;
		const mod = (await import(importPath)) as FileRouteModule;

		if (mod.default) {
			routes.push(mod.default);
			continue;
		}

		if (!mod.handler) {
			continue;
		}

		routes.push({
			method,
			path,
			handler: mod.handler,
			...(mod.schema ? { schema: mod.schema } : {}),
		} as RouteDefinition);
	}

	return routes;
}
