import { WebClient } from "@slack/web-api";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class SlackClient implements ConnectedClient {
	constructor(public readonly web: WebClient) {}
}

export class SlackIntegration implements Integration<SlackClient, any> {
	readonly serviceId = Service.Slack;
	private client: WebClient | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Slack OAuth token is required");
		}
	}

	async connect(): Promise<SlackClient> {
		if (this.client) {
			return new SlackClient(this.client);
		}

		this.client = new WebClient(this.config.credentials.oauth2Token);
		return new SlackClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.web.auth.test();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
