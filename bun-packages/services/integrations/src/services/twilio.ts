import { Twilio } from "twilio";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class TwilioClient implements ConnectedClient {
	constructor(public readonly twilio: Twilio) {}
}

export class TwilioIntegration implements Integration<TwilioClient, any> {
	readonly serviceId = Service.Twilio;
	private client: Twilio | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.accountSid || !config.credentials?.authToken) {
			throw new ConfigError("Twilio Account SID and Auth Token are required");
		}
	}

	async connect(): Promise<TwilioClient> {
		if (this.client) {
			return new TwilioClient(this.client);
		}

		this.client = new Twilio(
			this.config.credentials.accountSid,
			this.config.credentials.authToken,
		);
		return new TwilioClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.twilio.api.accounts(this.config.credentials.accountSid).fetch();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
