import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class BitbucketClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}

export class BitbucketIntegration implements Integration<BitbucketClient, any> {
	readonly serviceId = Service.Bitbucket;
	private client: BitbucketClient | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Bitbucket OAuth token is required");
		}
	}

	async connect(): Promise<BitbucketClient> {
		if (this.client) {
			return this.client;
		}

		this.client = new BitbucketClient(this.config.credentials.oauth2Token);
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
