import { Client } from "@sendgrid/client";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class SendGridClient implements ConnectedClient {
	constructor(public readonly client: Client) {}
}

export class SendGridIntegration implements Integration<SendGridClient, any> {
	readonly serviceId = Service.SendGrid;
	private client: any = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.apiKey) {
			throw new ConfigError("SendGrid API key is required");
		}
	}

	async connect(): Promise<SendGridClient> {
		if (this.client) {
			return new SendGridClient(this.client);
		}

		this.client = new Client();
		this.client.setApiKey(this.config.credentials.apiKey);
		return new SendGridClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.client.request({
				method: "GET",
				url: "/user/profile",
			});
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
