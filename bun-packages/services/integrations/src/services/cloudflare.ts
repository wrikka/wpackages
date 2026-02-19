import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class CloudflareClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}

export class CloudflareIntegration implements Integration<CloudflareClient, any> {
	readonly serviceId = Service.Cloudflare;
	private client: CloudflareClient | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Cloudflare OAuth token is required");
		}
	}

	async connect(): Promise<CloudflareClient> {
		if (this.client) {
			return this.client;
		}

		this.client = new CloudflareClient(this.config.credentials.oauth2Token);
		return this.client;
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.connect();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
