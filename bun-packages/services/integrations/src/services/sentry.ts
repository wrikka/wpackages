import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class SentryClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class SentryIntegration implements Integration<SentryClient, any> {
	readonly serviceId = Service.Sentry;
	private client: SentryClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("Sentry OAuth token is required");
	}
	async connect(): Promise<SentryClient> {
		if (this.client) return this.client;
		this.client = new SentryClient(this.config.credentials.oauth2Token);
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
