import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class GoogleCloudFunctionsClient implements ConnectedClient {
	constructor(public readonly token: string) {}
}
export class GoogleCloudFunctionsIntegration implements Integration<GoogleCloudFunctionsClient, any> {
	readonly serviceId = Service.GoogleCloudFunctions;
	private client: GoogleCloudFunctionsClient | null = null;
	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) throw new ConfigError("Google Cloud Functions OAuth token is required");
	}
	async connect(): Promise<GoogleCloudFunctionsClient> {
		if (this.client) return this.client;
		this.client = new GoogleCloudFunctionsClient(this.config.credentials.oauth2Token);
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
