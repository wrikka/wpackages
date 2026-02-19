import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class AwsLambdaClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class AwsLambdaIntegration implements Integration<AwsLambdaClient, any> {
	readonly serviceId = Service.AwsLambda;
	private client: AwsLambdaClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("AWS Lambda OAuth token is required");
	}
	async connect(): Promise<AwsLambdaClient> {
		if (this.client) return this.client;
		this.client = new AwsLambdaClient(this.config.credentials.oauth2Token);
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
