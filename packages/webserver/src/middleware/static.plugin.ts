import path from "node:path";
import type { Plugin } from "../lib/core";

export interface StaticPluginOptions {
	publicDir?: string;
}

export const staticPlugin = (options: StaticPluginOptions = {}): Plugin => {
	const publicDir = options.publicDir || path.join(process.cwd(), "public");

	return {
		name: "static",
		setup: (app) => {
			app.beforeHandle(async ({ req }) => {
				const url = new URL(req.url);
				const filePath = path.join(publicDir, url.pathname);

				try {
					const file = Bun.file(filePath);
					const exists = await file.exists();

					if (exists) {
						return new Response(file);
					}
				} catch (error) {
					// Ignore errors (e.g., directory access), let it fall through to the router
				}
			});
		},
	};
};
