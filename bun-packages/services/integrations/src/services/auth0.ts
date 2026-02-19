import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types";
import { Service, Auth0Credentials } from "../types";

export class Auth0Client implements ConnectedClient {
	constructor(public readonly credentials: Auth0Credentials) { }
}

export class Auth0Integration implements Integration<Auth0Client, Auth0Credentials> {
	readonly serviceId = Service.Auth0;
	private client: Auth0Client | null = null;

	constructor(public config: ServiceConfig<Auth0Credentials>) {
		if (!config.credentials?.domain || !config.credentials?.clientId || !config.credentials?.clientSecret) {
			throw new ConfigError("Auth0 domain, client ID, and client secret are required");
		}
	}

	async connect(): Promise<Auth0Client> {
		if (this.client) return this.client;
		this.client = new Auth0Client(this.config.credentials);
		return this.client;
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.connect();
			return { success: true };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
		}
	}
}
