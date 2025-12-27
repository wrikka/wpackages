/**
 * Application composition layer
 * Composes all modules and provides the main entry point
 */

// Import all modules
import * as components from "./components";
import * as config from "./config";
import * as constant from "./constant";
import * as services from "./services";
import * as types from "./types";
import * as utils from "./utils";

/**
 * Application context - bundles all modules
 */
export interface ApiIntegrationApp {
	readonly components: typeof components;
	readonly config: typeof config;
	readonly constant: typeof constant;
	readonly services: typeof services;
	readonly types: typeof types;
	readonly utils: typeof utils;
}

/**
 * Create application instance with all modules
 */
export const createApp = (): ApiIntegrationApp => ({
	components,
	config,
	constant,
	services,
	types,
	utils,
});

/**
 * Default app instance
 */
export const app = createApp();
