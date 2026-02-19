/**
 * Testing configuration
 */

export type Reporter = "text" | "json" | "html";

export interface TestConfig {
	timeout: number;
	retries: number;
	parallel: boolean;
	verbose: boolean;
	coverage: boolean;
	include: string[];
	exclude: string[];
	globals: boolean;
	environment: "node" | "jsdom";
	setupFiles: string[];
	reporters: Reporter[];
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
	include: ["**/*.test.ts", "**/*.spec.ts"],
	exclude: ["**/node_modules/**", "**/dist/**"],
	globals: false,
	environment: "node",
	setupFiles: [],
	reporters: ["text"],
};

/**
 * Create test config
 */
export const createConfig = (partial: Partial<TestConfig> = {}): TestConfig => ({
	...defaultConfig,
	...partial,
});

export { defineConfig } from "./define";
