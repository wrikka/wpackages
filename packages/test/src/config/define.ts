/**
 * A helper function for defining test configurations with type safety.
 */

import type { TestConfig } from ".";

export const defineConfig = (config: Partial<TestConfig>): Partial<TestConfig> => {
	return config;
};
