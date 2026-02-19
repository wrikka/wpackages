import { Client, GatewayIntentBits } from "discord.js";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class DiscordClient implements ConnectedClient {
	constructor(public readonly client: Client) {}
}

export class DiscordIntegration implements Integration<DiscordClient, any> {
	readonly serviceId = Service.Discord;
	private client: Client | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("Discord OAuth token is required");
		}
	}

	async connect(): Promise<DiscordClient> {
		if (this.client) {
			return new DiscordClient(this.client);
		}

		this.client = new Client({
			intents: [GatewayIntentBits.Guilds],
		});
		void this.client.login(this.config.credentials.oauth2Token);

		return new DiscordClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			if (!client.client.isReady()) {
				throw new Error("Discord client not ready");
			}
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
