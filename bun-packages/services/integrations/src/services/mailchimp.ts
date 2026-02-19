import Mailchimp from "@mailchimp/mailchimp_marketing";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class MailchimpClient implements ConnectedClient {
	constructor(public readonly client: any) {}
}

export class MailchimpIntegration implements Integration<MailchimpClient, any> {
	readonly serviceId = Service.Mailchimp;
	private client: any = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.apiKey) {
			throw new ConfigError("Mailchimp API key is required");
		}
	}

	async connect(): Promise<MailchimpClient> {
		if (this.client) {
			return new MailchimpClient(this.client);
		}

		this.client = Mailchimp;
		this.client.setConfig({
			apiKey: this.config.credentials.apiKey,
		});
		return new MailchimpClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.client.ping.get();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
