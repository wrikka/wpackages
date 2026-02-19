import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class NetlifyClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}

export class NetlifyIntegration implements Integration<NetlifyClient, any> {
	readonly serviceId = Service.Netlify;
	private client: NetlifyClient | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Netlify OAuth token is required");
		}
	}

	async connect(): Promise<NetlifyClient> {
		if (this.client) {
			return this.client;
		}

		this.client = new NetlifyClient(this.config.credentials.oauth2Token);
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
