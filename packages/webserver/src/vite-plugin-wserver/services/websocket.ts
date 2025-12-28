import { WebSocketServer } from "ws";
import type { WServerOptions } from "../types";

export function createWebSocketServer(options: WServerOptions) {
	if (!options.features?.websocket) return null;

	const wss = new WebSocketServer({ noServer: true });

	wss.on("connection", (ws) => {
		console.log("[wserver] WebSocket client connected");
		ws.on("message", (message) => {
			console.log(`[wserver] WebSocket received: ${message}`);
			// Broadcast to all clients
			wss.clients.forEach((client) => {
				if (client !== ws && client.readyState === ws.OPEN) {
					client.send(message);
				}
			});
		});
		ws.on("close", () => {
			console.log("[wserver] WebSocket client disconnected");
		});
	});

	console.log("[wserver] WebSocket server created.");
	return wss;
}
