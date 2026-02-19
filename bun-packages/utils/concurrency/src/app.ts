/**
 * Application entry point
 */

import type { ConcurrencyConfig } from "./config";
import { defaultConcurrencyConfig } from "./config";

export type ConcurrencyApp = {
	readonly config: ConcurrencyConfig;
};

/**
 * Create concurrency application with custom config
 */
export const createConcurrencyApp = (
	config: Partial<ConcurrencyConfig> = {},
): ConcurrencyApp => {
	const finalConfig: ConcurrencyConfig = { ...defaultConcurrencyConfig, ...config };

	return {
		config: finalConfig,
		// Application logic here
	};
};

/**
 * Default concurrency app instance
 */
export const app: ConcurrencyApp = createConcurrencyApp();
