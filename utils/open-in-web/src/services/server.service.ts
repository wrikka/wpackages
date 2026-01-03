import type { Server } from "bun";
import { watch } from "fs";
import type { FSWatcher } from "fs";

export interface WebSocketData {
	filepath: string;
}

export interface ServerOptions {
	port: number;
	filepath: string;
	htmlContent: string;
	disableLiveReload?: boolean;
}

let watcher: FSWatcher | null = null;

export function startServer(options: ServerOptions): Server<WebSocketData> {
	if (watcher) {
		watcher.close();
	}

	const server = Bun.serve<WebSocketData>({
		port: options.port,
		fetch(req, server) {
			const url = new URL(req.url);
			if (url.pathname === "/ws") {
				const success = server.upgrade(req, {
					data: { filepath: options.filepath },
				});
				return success ? undefined : new Response("WebSocket upgrade error", { status: 400 });
			}

			if (url.pathname === "/") {
				return new Response(options.htmlContent, {
					headers: { "Content-Type": "text/html" },
				});
			}

			return new Response("Not Found", { status: 404 });
		},
		websocket: {
			open(ws) {
				if (options.disableLiveReload) return;
				console.log("WebSocket connection opened");
				watcher = watch(ws.data.filepath, (event: string, _filename: string | null) => {
					if (event === "change") {
						console.log(`File changed, reloading...`);
						ws.send("reload");
					}
				});
			},
			close(_ws) {
				console.log("WebSocket connection closed");
				if (watcher) {
					watcher.close();
					watcher = null;
				}
			},
			message(_ws, _message) {},
		},
	});

	console.log(`Server running at http://localhost:${server.port}`);
	return server;
}
