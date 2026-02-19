import type { VitextConfig } from "../types/config";
import type { VitextServer } from "../types/server";
import { logInfo } from "../utils/logger";

/**
 * Create a Vitext server instance
 */
export const createServer = (config: VitextConfig): VitextServer => {
	return {
		port: config.server.port,
		fetch: async (_req: Request) => {
			// In a real implementation, this would route the request
			return new Response("Vitext Server", {
				headers: { "Content-Type": "text/plain" },
			});
		},
	};
};

/**
 * Start the server
 */
export const startServer = async (server: VitextServer): Promise<void> => {
	logInfo(`Starting server on port ${server.port}`);
	// In a real implementation, this would start the actual server
	logInfo("Server started!");
};
