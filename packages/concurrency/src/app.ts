/**
 * Application entry point
 */

import type { ConcurrencyConfig } from "./config";
import { defaultConcurrencyConfig } from "./config";

/**
 * Create concurrency application with custom config
 */
export const createConcurrencyApp = (
	config: Partial<ConcurrencyConfig> = {},
) => {
	const finalConfig = { ...defaultConcurrencyConfig, ...config };

	return {
		config: finalConfig,
		// Application logic here
	};
};

/**
 * Default concurrency app instance
 */
export const app = createConcurrencyApp();
