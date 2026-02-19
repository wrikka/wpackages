import { ServerClient } from "postmark";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class PostmarkClient implements ConnectedClient {
	constructor(public readonly client: ServerClient) {}
}

export class PostmarkIntegration implements Integration<PostmarkClient, any> {
	readonly serviceId = Service.Postmark;
	private client: ServerClient | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Postmark server token is required");
		}
	}

	async connect(): Promise<PostmarkClient> {
		if (this.client) {
			return new PostmarkClient(this.client);
		}

		this.client = new ServerClient(this.config.credentials.oauth2Token);
		return new PostmarkClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.client.getServer();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
