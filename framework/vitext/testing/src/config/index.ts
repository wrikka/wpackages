/**
 * Testing configuration
 */

export interface TestConfig {
	timeout: number;
	retries: number;
	parallel: boolean;
	verbose: boolean;
	coverage: boolean;
}

/**
 * Default test configuration
 */
export const defaultConfig: TestConfig = {
	timeout: 5000,
	retries: 0,
	parallel: true,
	verbose: false,
	coverage: false,
};

/**
 * Create test config
 */
export const createConfig = (partial: Partial<TestConfig> = {}): TestConfig => ({
	...defaultConfig,
	...partial,
});
