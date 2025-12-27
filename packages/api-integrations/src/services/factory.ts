import type { IntegrationClient, IntegrationConfig } from "../index";
import type { IntegrationError } from "../types/integration";

/**
 * Factory helpers for creating integrations
 */

/**
 * Integration factory function type
 */
export type IntegrationFactory<TClient extends IntegrationClient> = () => TClient | IntegrationError;

/**
 * Integration registry
 */
const integrationRegistry = new Map<
	string,
	IntegrationFactory<IntegrationClient>
>();

/**
 * Register an integration factory
 */
export const registerIntegration = <TClient extends IntegrationClient>(
	name: string,
	factory: IntegrationFactory<TClient>,
): void => {
	integrationRegistry.set(name.toLowerCase(), factory);
};

/**
 * Get an integration factory by name
 */
export const getIntegrationFactory = <TClient extends IntegrationClient>(
	name: string,
): IntegrationFactory<TClient> | undefined => {
	return integrationRegistry.get(name.toLowerCase()) as IntegrationFactory<TClient> | undefined;
};

/**
 * Create an integration by name
 */
export const createIntegration = <TClient extends IntegrationClient>(
	name: string,
): TClient | IntegrationError => {
	const factory = getIntegrationFactory<TClient>(name);

	if (!factory) {
		return {
			type: "validation" as const,
			message: `Unknown integration: ${name}`,
			field: "name",
		};
	}

	return factory();
};

/**
 * Builder pattern for creating integrations
 */
export class IntegrationBuilder<TConfig extends IntegrationConfig> {
	private config: Partial<TConfig> = {};

	withApiKey(apiKey: string): this {
		this.config = { ...this.config, apiKey } as Partial<TConfig>;
		return this;
	}

	withName(name: string): this {
		this.config = { ...this.config, name } as Partial<TConfig>;
		return this;
	}

	withBaseUrl(baseUrl: string): this {
		this.config = { ...this.config, baseUrl } as Partial<TConfig>;
		return this;
	}

	withTimeout(timeout: number): this {
		this.config = { ...this.config, timeout } as Partial<TConfig>;
		return this;
	}

	withRetryAttempts(retryAttempts: number): this {
		this.config = { ...this.config, retryAttempts } as Partial<TConfig>;
		return this;
	}

	withConfig(config: Partial<TConfig>): this {
		this.config = { ...this.config, ...config };
		return this;
	}

	build(): TConfig | IntegrationError {
		if (!this.config.apiKey) {
			return {
				type: "validation" as const,
				message: "API key is required",
				field: "apiKey",
			};
		}

		if (!this.config.name) {
			return {
				type: "validation" as const,
				message: "Integration name is required",
				field: "name",
			};
		}

		return this.config as TConfig;
	}
}

/**
 * Create an integration builder
 */
export const createIntegrationBuilder = <
	TConfig extends IntegrationConfig,
>(): IntegrationBuilder<TConfig> => {
	return new IntegrationBuilder<TConfig>();
};

/**
 * Fluent API for quick integration setup
 */
export const integration = <TConfig extends IntegrationConfig>(
	name: string,
): IntegrationBuilder<TConfig> => {
	return createIntegrationBuilder<TConfig>().withName(name);
};
