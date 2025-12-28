import { createApp, toNodeListener } from "h3";
import type { Plugin } from "vite";
import { createAuthMiddleware } from "../services/auth";
import { createApiRouter } from "../services/router";
import { setupTasks } from "../services/tasks";
import { createWebSocketServer } from "../services/websocket";
import type { WServerOptions } from "../types";

/**
 * The main wserver plugin.
 * @param options - The wserver options.
 * @returns A Vite plugin.
 */
export default function wserver(options: WServerOptions): Plugin {
	return {
		name: "vite-plugin-wserver",
		apply: "serve",
		async configureServer(server) {
			console.log("[wserver] Starting server...");

			const app = createApp();
			const apiRouter = await createApiRouter(options);
			app.use(createAuthMiddleware(options));
			app.use(apiRouter.handler);

			// Add h3 server as middleware
			server.middlewares.use(toNodeListener(app));

			// Setup WebSocket server
			const wss = createWebSocketServer(options);
			if (wss) {
				server.httpServer?.on("upgrade", (req, socket, head) => {
					if (
						req.url?.startsWith(options.routing?.websocket?.prefix || "/ws")
					) {
						wss.handleUpgrade(req, socket, head, (ws) => {
							wss.emit("connection", ws, req);
						});
					}
				});
			}

			// Setup cron jobs
			setupTasks(options);

			console.log("[wserver] Server started.");
		},
	};
}
