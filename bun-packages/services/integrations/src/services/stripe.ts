import Stripe from "stripe";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class StripeClient implements ConnectedClient {
	constructor(public readonly stripe: Stripe) {}
}

export class StripeIntegration implements Integration<StripeClient, any> {
	readonly serviceId = Service.Stripe;
	private client: Stripe | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.apiKey) {
			throw new ConfigError("Stripe API key is required");
		}
	}

	async connect(): Promise<StripeClient> {
		if (this.client) {
			return new StripeClient(this.client);
		}

		this.client = new Stripe(this.config.credentials.apiKey);
		return new StripeClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.stripe.accounts.retrieve();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
