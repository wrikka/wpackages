import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class NeonClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class NeonIntegration implements Integration<NeonClient, any> {
	readonly serviceId = Service.Neon;
	private client: NeonClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("Neon OAuth token is required");
	}
	async connect(): Promise<NeonClient> {
		if (this.client) return this.client;
		this.client = new NeonClient(this.config.credentials.oauth2Token);
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
