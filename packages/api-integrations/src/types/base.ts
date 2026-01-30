/**
 * Base Integration Config
 */
export interface IntegrationConfig {
	name: string;
	apiKey: string;
	baseUrl?: string;
	timeout?: number;
	retryAttempts?: number;
}

/**
 * Base Integration Client
 */
export interface IntegrationClient {
	name: string;
	config: IntegrationConfig;
}
