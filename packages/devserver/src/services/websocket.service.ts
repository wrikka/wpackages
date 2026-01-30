/**
 * WebSocket server for @wpackages/devserver HMR and devtools
 * No Vite coupling - pure devserver implementation
 */

import type { Server } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import type { DevServerWs, WsMessage } from "../types/ws";

export function createWebSocketServer(httpServer: Server): DevServerWs {
	const wss = new WebSocketServer({ server: httpServer });
	const clients = new Set<WebSocket>();

	wss.on("connection", (ws: WebSocket) => {
		clients.add(ws);
		console.log("WebSocket client connected");

		ws.on("close", () => {
			clients.delete(ws);
			console.log("WebSocket client disconnected");
		});

		ws.on("error", (error) => {
			console.error("WebSocket error:", error);
			clients.delete(ws);
		});
	});

	return {
		on: (event: "connection", listener) => {
			if (event === "connection") {
				wss.on("connection", listener);
			}
		},
		getClientCount: () => {
			return clients.size;
		},
		send: (type: string, data: unknown) => {
			const message: WsMessage = { type, data };
			const messageStr = JSON.stringify(message);

			for (const client of clients) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(messageStr);
				}
			}
		},
		broadcast: (message: WsMessage) => {
			const messageStr = JSON.stringify(message);

			for (const client of clients) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(messageStr);
				}
			}
		},
	};
}
