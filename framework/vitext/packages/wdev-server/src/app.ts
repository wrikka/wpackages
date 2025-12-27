/**
 * Application composition layer
 * Composes all services and components
 */

import { createDevServer } from "./services";
import type { DevServerConfig, DevServerInstance } from "./types";

/**
 * Create and configure development server application
 */
export const createApp = (config: Partial<DevServerConfig> = {}): DevServerInstance => {
	return createDevServer(config);
};
