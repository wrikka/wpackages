import { createApp, createRouter, eventHandler } from "h3";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { injectHtml } from "./services/html-inject.service";

export function createServer(root: string = process.cwd()) {
	const app = createApp();
	const router = createRouter();

	// Serve HMR client
	router.get(
		"/@wdev/hmr-client.js",
		eventHandler(async () => {
			const clientPath = join(__dirname, "client", "hmr-client.ts");
			const content = await readFile(clientPath, "utf-8");
			return new Response(content, {
				headers: { "Content-Type": "application/javascript" },
			});
		}),
	);

	// Serve static files with HTML injection
	router.get(
		"/*",
		eventHandler(async (event) => {
			const url = new URL(event.request.url);
			const filePath = join(root, url.pathname.slice(1));

			try {
				const content = await readFile(filePath, "utf-8");
				const ext = extname(filePath);

				let contentType = "text/plain";
				if (ext === ".html") {
					contentType = "text/html";
					// Inject HMR client into HTML
					const injectedContent = await injectHtml(content);
					return new Response(injectedContent, {
						headers: { "Content-Type": contentType },
					});
				} else if (ext === ".js") {
					contentType = "application/javascript";
				} else if (ext === ".css") {
					contentType = "text/css";
				}

				return new Response(content, {
					headers: { "Content-Type": contentType },
				});
			} catch {
				// File not found, try to serve index.html for SPA routing
				if (url.pathname !== "/") {
					try {
						const indexPath = join(root, "index.html");
						const indexContent = await readFile(indexPath, "utf-8");
						const injectedContent = await injectHtml(indexContent);
						return new Response(injectedContent, {
							headers: { "Content-Type": "text/html" },
						});
					} catch {
						// Index not found either
					}
				}

				return new Response("Not Found", { status: 404 });
			}
		}),
	);

	app.use(router);

	return app;
}
