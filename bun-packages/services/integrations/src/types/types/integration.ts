import { ServiceConfig } from './base';

/**
 * Integration interface for service implementations.
 * @template TClient - Connected client type.
 * @template TCredentials - Credentials type for the service.
 */
export interface Integration<TClient, TCredentials> {
  /** Service configuration */
  config: ServiceConfig<TCredentials>;

  /** Connect to the service and return a client */
  connect(): Promise<TClient>;

  /** Verify service connection */
  verify(): Promise<{ success: boolean; error?: string }>;
}

/**
 * Base interface for connected clients.
 */
export interface ConnectedClient {
  // Base interface for connected clients
}
