import type { Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

// Define constructor signature for an integration class
type IntegrationConstructor<TClient, TCredentials> = new(
	config: ServiceConfig<TCredentials>,
) => Integration<TClient, TCredentials>;

// The registry will store constructors, not instances
const integrationRegistry = new Map<Service, IntegrationConstructor<any, any>>();

/**
 * Registers an integration implementation with SDK.
 * @param service - The service enum member (e.g., Service.GitHub).
 * @param constructor - The class that implements integration.
 */
export function registerIntegration<TClient, TCredentials>(
	service: Service,
	constructor: IntegrationConstructor<TClient, TCredentials>,
) {
	if (integrationRegistry.has(service)) {
		console.warn(`Warning: Overwriting registration for service '${service}'.`);
	}
	integrationRegistry.set(service, constructor);
}

/**
 * Retrieves implementation (constructor) for a given service.
 * @param service - The service enum member.
 * @returns The constructor for requested service integration.
 */
export function getIntegrationImplementation(service: Service): IntegrationConstructor<any, any> | undefined {
	return integrationRegistry.get(service);
}
