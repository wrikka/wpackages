import fs from "node:fs";
import { resolve } from "node:path";
import type { DevServerContext } from "../types/ws";
import type { AnyWsMessage, WsConfigMessage, WsModuleGraphResponseMessage, WsPackageInfoMessage } from "../types/ws";

export const handleWebSocket = (
	context: DevServerContext & { moduleGraph?: { getStats: () => { modules: number; edges: number } } },
) => {
	context.ws.on("connection", (ws) => {
		ws.on("message", (data: Buffer) => {
			const message: AnyWsMessage = JSON.parse(data.toString());

			if (message.type === "wdev:client-ready") {
				const configMessage: WsConfigMessage = {
					type: "wdev:config",
					data: {
						root: context.root,
						port: context.port,
						hostname: context.hostname,
					},
				};
				context.ws.send(configMessage.type, configMessage.data);

				const packageJsonPath = resolve(context.root, "package.json");
				try {
					const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
					const packageMessage: WsPackageInfoMessage = {
						type: "wdev:package-info",
						data: { packageJson },
					};
					context.ws.send(packageMessage.type, packageMessage.data);
				} catch (e) {
					console.error("wdevtools: could not find or parse package.json", e);
				}
			}

			if (message.type === "wdev:get-module-graph") {
				const stats = context.moduleGraph?.getStats() || { modules: 0, edges: 0 };
				const graphMessage: WsModuleGraphResponseMessage = {
					type: "wdev:module-graph",
					data: {
						nodes: [
							{ id: "root", label: "Root" },
							{ id: "stats", label: `Modules: ${stats.modules}, Edges: ${stats.edges}` },
						],
						edges: [{ from: "root", to: "stats" }],
					},
				};
				context.ws.send(graphMessage.type, graphMessage.data);
			}
		});
	});
};
