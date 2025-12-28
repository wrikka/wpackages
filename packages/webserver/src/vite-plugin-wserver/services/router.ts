import { resolve } from "node:path";
import { glob } from "glob";
import { createRouter, type EventHandler } from "h3";
import type { WServerOptions } from "../types";

const HTTP_METHOD_EXPORTS = [
	"GET",
	"POST",
	"PUT",
	"DELETE",
	"PATCH",
	"OPTIONS",
	"HEAD",
] as const;

const listRouteFiles = async (absoluteDir: string): Promise<string[]> => {
	if (typeof Bun !== "undefined" && typeof Bun.Glob === "function") {
		const pattern = `${absoluteDir.replace(/\\/g, "/")}/**/*.{ts,js}`;
		const files: string[] = [];
		for (const file of new Bun.Glob(pattern).scanSync()) {
			files.push(file);
		}
		return files;
	}

	return glob(`${absoluteDir.replace(/\\/g, "/")}/**/*.{ts,js}`);
};

const fileToRoutePath = (file: string, baseDir: string): string => {
	const normalizedBase = baseDir.replace(/\\/g, "/");
	const normalizedFile = file.replace(/\\/g, "/");
	const withoutBase = normalizedFile.startsWith(normalizedBase)
		? normalizedFile.slice(normalizedBase.length)
		: normalizedFile;

	const withoutExt = withoutBase.replace(/\.(ts|js)$/, "");
	const withoutIndex = withoutExt.replace(/\/index$/, "");
	const withParams = withoutIndex
		.replace(/\[\.\.\.(.+?)\]/g, ":$1(.*)")
		.replace(/\[(.+?)\]/g, ":$1");

	return withParams === "" ? "/" : withParams;
};

const joinPrefix = (prefix: string | undefined, path: string): string => {
	const base = (prefix ?? "").trim();
	if (!base) return path;
	const p = base.startsWith("/") ? base : `/${base}`;
	const trimmed = p.endsWith("/") ? p.slice(0, -1) : p;
	return path === "/" ? trimmed : `${trimmed}${path}`;
};

export async function createApiRouter(
	options: WServerOptions,
): Promise<ReturnType<typeof createRouter>> {
	const router = createRouter();

	if (!options.routing?.api?.directory) {
		return router;
	}

	const apiDir = resolve(process.cwd(), options.routing.api.directory);
	const files = await listRouteFiles(apiDir);
	const prefix = options.routing.api.prefix;

	for (const file of files) {
		const routePath = fileToRoutePath(file, apiDir);
		const finalRoutePath = joinPrefix(prefix, routePath);

		try {
			const handlerModule = await import(file);
			for (const [key, handler] of Object.entries(handlerModule)) {
				if (typeof handler === "function") {
					if (key === "default") {
						router.use(finalRoutePath, handler as EventHandler);
						continue;
					}

					const upper = key.toUpperCase();
					if (
						(HTTP_METHOD_EXPORTS as readonly string[]).includes(upper)
					) {
						// @ts-expect-error - method is decided at runtime from file exports
						router[upper.toLowerCase()](finalRoutePath, handler as EventHandler);
					}
				}
			}
		} catch (error) {
			console.error(`[wserver] Error loading route ${routePath}:`, error);
		}
	}

	return router;
}
