import { createAuthenticationError } from "../components/error-factory";
import type { IntegrationConfig, IntegrationError } from "../types";

/**
 * Create integration config from environment variables
 */
export const createIntegrationConfig = <T extends IntegrationConfig>(
	getEnv: (key: string) => string | undefined,
	integrationName: string,
	defaults?: Partial<T>,
): T | IntegrationError => {
	const apiKey = getEnv(`${integrationName}_API_KEY`);

	if (!apiKey) {
		return createAuthenticationError(
			`Missing API key for ${integrationName}`,
			"MISSING_API_KEY",
		);
	}

	return {
		name: integrationName,
		apiKey,
		baseUrl: getEnv(`${integrationName}_BASE_URL`) || "",
		timeout: Number(getEnv(`${integrationName}_TIMEOUT`)) || 30000,
		retryAttempts: Number(getEnv(`${integrationName}_RETRY`)) || 3,
		...defaults,
	} as T;
};
