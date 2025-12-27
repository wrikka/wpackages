/**
 * Tests for the Config system
 */

import { describe, expect, it } from "vitest";
import {
	createConfigBuilder,
	defineConfig,
	getConfig,
	initConfig,
	loadConfigFromFile,
	loadConfigWithManager,
	mergeConfig,
	resolveConfig,
	setConfig,
} from "./index";

describe("Config System", () => {
	it("should create config with defineConfig", () => {
		const config = defineConfig({
			cache: {
				enabled: true,
				maxSize: 1000,
				ttl: 60000,
				evictionPolicy: "lru",
			},
			concurrency: {
				maxConcurrent: 10,
				queueSize: 100,
			},
			configManager: {
				enabled: true,
				watch: true,
			},
		});

		expect(config.cache?.enabled).toBe(true);
		expect(config.cache?.maxSize).toBe(1000);
		expect(config.concurrency?.maxConcurrent).toBe(10);
		expect(config.configManager?.enabled).toBe(true);
	});

	it("should create config with builder pattern", () => {
		const config = createConfigBuilder()
			.cache({ enabled: true, maxSize: 1000 })
			.concurrency({ maxConcurrent: 10 })
			.configManager({ enabled: true, watch: true })
			.build();

		expect(config.cache?.enabled).toBe(true);
		expect(config.cache?.maxSize).toBe(1000);
		expect(config.concurrency?.maxConcurrent).toBe(10);
		expect(config.configManager?.enabled).toBe(true);
	});

	it("should merge configs correctly", () => {
		const config1 = defineConfig({
			cache: {
				enabled: true,
				maxSize: 1000,
			},
			concurrency: {
				maxConcurrent: 10,
			},
		});

		const config2 = defineConfig({
			cache: {
				ttl: 60000,
				evictionPolicy: "lru",
			},
			configManager: {
				enabled: true,
			},
		});

		const merged = mergeConfig(config1, config2);

		expect(merged.cache?.enabled).toBe(true);
		expect(merged.cache?.maxSize).toBe(1000);
		expect(merged.cache?.ttl).toBe(60000);
		expect(merged.cache?.evictionPolicy).toBe("lru");
		expect(merged.concurrency?.maxConcurrent).toBe(10);
		expect(merged.configManager?.enabled).toBe(true);
	});

	it("should resolve config with defaults", () => {
		const resolved = resolveConfig(null);

		expect(resolved.plugins).toEqual([]);
		expect(resolved.cache).toEqual({});
		expect(resolved.concurrency).toEqual({});
		expect(resolved.configManager).toEqual({});
	});

	it("should manage global config state", () => {
		// Get default config
		const defaultConfig = getConfig();
		expect(defaultConfig.plugins).toEqual([]);

		// Set new config
		const newConfig = defineConfig({
			cache: { enabled: true },
			concurrency: { maxConcurrent: 5 },
		});

		setConfig(newConfig);
	});

	it("should have config file loading function", () => {
		expect(typeof loadConfigFromFile).toBe("function");
		expect(typeof loadConfigWithManager).toBe("function");
		expect(typeof initConfig).toBe("function");
	});
});
