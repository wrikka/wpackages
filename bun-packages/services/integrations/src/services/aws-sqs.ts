import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class AwsSqsClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class AwsSqsIntegration implements Integration<AwsSqsClient, any> {
	readonly serviceId = Service.AwsSqs;
	private client: AwsSqsClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("AWS SQS OAuth token is required");
	}
	async connect(): Promise<AwsSqsClient> {
		if (this.client) return this.client;
		this.client = new AwsSqsClient(this.config.credentials.oauth2Token);
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
