/**
 * Configuration management for resilience patterns
 */

import {
	DEFAULT_BULKHEAD_LIMIT,
	DEFAULT_CIRCUIT_BREAKER_THRESHOLD,
	DEFAULT_RATE_LIMIT_RPS,
	DEFAULT_RETRY_ATTEMPTS,
	DEFAULT_TIMEOUT,
} from "../constant";
import type { ResilienceConfig } from "../types";

/**
 * Default resilience configuration
 */
export const defaultConfig: ResilienceConfig = {
	timeout: DEFAULT_TIMEOUT,
	retryAttempts: DEFAULT_RETRY_ATTEMPTS,
	circuitBreakerThreshold: DEFAULT_CIRCUIT_BREAKER_THRESHOLD,
	bulkheadLimit: DEFAULT_BULKHEAD_LIMIT,
	rateLimitRps: DEFAULT_RATE_LIMIT_RPS,
} as const;

/**
 * Merge user config with defaults
 */
export const createConfig = (userConfig: Partial<ResilienceConfig> = {}): ResilienceConfig => ({
	...defaultConfig,
	...userConfig,
});

/**
 * Validate configuration
 */
export const validateConfig = (config: ResilienceConfig): boolean => {
	return (
		(config.timeout === undefined || config.timeout > 0)
		&& (config.retryAttempts === undefined || config.retryAttempts >= 0)
		&& (config.circuitBreakerThreshold === undefined || config.circuitBreakerThreshold > 0)
		&& (config.bulkheadLimit === undefined || config.bulkheadLimit > 0)
		&& (config.rateLimitRps === undefined || config.rateLimitRps > 0)
	);
};
