import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class VercelClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}

export class VercelIntegration implements Integration<VercelClient, any> {
	readonly serviceId = Service.Vercel;
	private client: VercelClient | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Vercel OAuth token is required");
		}
	}

	async connect(): Promise<VercelClient> {
		if (this.client) {
			return this.client;
		}

		this.client = new VercelClient(this.config.credentials.oauth2Token);
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
