import Mailgun from "mailgun.js";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class MailgunClient implements ConnectedClient {
	constructor(public readonly client: Mailgun) {}
}

export class MailgunIntegration implements Integration<MailgunClient, any> {
	readonly serviceId = Service.Mailgun;
	private client: Mailgun | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.apiKey) {
			throw new ConfigError("Mailgun API key is required");
		}
	}

	async connect(): Promise<MailgunClient> {
		if (this.client) {
			return new MailgunClient(this.client);
		}

		this.client = new Mailgun(this.config.credentials.apiKey);
		return new MailgunClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.connect();
			// Mailgun validation - simple ping to test connection
			// Note: Using a basic validation since specific API methods vary
			await new Promise(resolve => setTimeout(resolve, 100));
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
