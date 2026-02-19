import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class ClerkClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class ClerkIntegration implements Integration<ClerkClient, any> {
	readonly serviceId = Service.Clerk;
	private client: ClerkClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("Clerk OAuth token is required");
	}
	async connect(): Promise<ClerkClient> {
		if (this.client) return this.client;
		this.client = new ClerkClient(this.config.credentials.oauth2Token);
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
