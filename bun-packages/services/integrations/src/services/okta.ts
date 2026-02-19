import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class OktaClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class OktaIntegration implements Integration<OktaClient, any> {
	readonly serviceId = Service.Okta;
	private client: OktaClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("Okta OAuth token is required");
	}
	async connect(): Promise<OktaClient> {
		if (this.client) return this.client;
		this.client = new OktaClient(this.config.credentials.oauth2Token);
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
