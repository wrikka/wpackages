import { extname, relative } from "node:path";
import { Effect } from "effect";
import { toPosixPath } from "../utils/path";
import { normalizeRoutePath, routeNameFromPath } from "../utils/route-utils";
import { walkDirectory } from "../services";
import { parseRouteParams } from "../utils";
import type { GenerateRoutesOptions, WRouteRecord, HttpMethod } from "../types";
import { DEFAULT_ROUTE_EXTENSIONS } from "../constants";

export const generateRoutes = (options: GenerateRoutesOptions): readonly WRouteRecord[] => {
	const extensions = options.extensions ?? DEFAULT_ROUTE_EXTENSIONS;
	const files = Effect.runSync(walkDirectory(options.pagesDir));

	const routes = files
		.filter((f) => extensions.includes(extname(f)))
		.map((file) => {
			const rel = toPosixPath(relative(options.pagesDir, file));
			const withoutExt = rel.replace(new RegExp(`${extname(rel)}$`), "");
			const base = options.base ?? "";
			const routePath = normalizeRoutePath(`${base}${withoutExt}`.replaceAll("//", "/").replace(/^\//, ""));
			const name = routeNameFromPath(withoutExt);
			const params = parseRouteParams(routePath);
			const methods: HttpMethod[] = ["GET"];

			return Object.freeze({ path: routePath, file, name, params, methods });
		})
		.sort((a, b) => a.path.localeCompare(b.path));

	return routes;
};
