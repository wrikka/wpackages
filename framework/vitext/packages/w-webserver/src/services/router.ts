import { resolve } from "node:path";
import { glob } from "glob";
import { createRouter, type EventHandler } from "h3";
import type { WServerOptions } from "../types";

export async function createApiRouter(
	options: WServerOptions,
): Promise<ReturnType<typeof createRouter>> {
	const router = createRouter();

	if (!options.routing?.api?.directory) {
		return router;
	}

	const apiDir = resolve(process.cwd(), options.routing.api.directory);
	const files = await glob(`${apiDir}/**/*.ts`);

	for (const file of files) {
		const routePath = file
			.replace(apiDir, "")
			.replace(/\\/g, "/") // Fix for Windows paths
			.replace(/\.(ts|js)$/, "")
			.replace(/\/index$/, "");

		try {
			const handlerModule = await import(file);
			for (const [key, handler] of Object.entries(handlerModule)) {
				if (typeof handler === "function") {
					const finalRoutePath = routePath === "" ? "/" : routePath;
					if (key === "default") {
						router.use(finalRoutePath, handler as EventHandler);
					} else {
						// @ts-expect-error - Dynamic method assignment
						router[key.toLowerCase() as "get" | "post" | "put" | "delete"](
							finalRoutePath,
							handler as EventHandler,
						);
					}
				}
			}
		} catch (error) {
			console.error(`[wserver] Error loading route ${routePath}:`, error);
		}
	}

	return router;
}
