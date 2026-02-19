import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class PayPalClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class PayPalIntegration implements Integration<PayPalClient, any> {
	readonly serviceId = Service.PayPal;
	private client: PayPalClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("PayPal OAuth token is required");
	}
	async connect(): Promise<PayPalClient> {
		if (this.client) return this.client;
		this.client = new PayPalClient(this.config.credentials.oauth2Token);
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
