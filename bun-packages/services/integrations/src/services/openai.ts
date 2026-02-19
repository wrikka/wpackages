import OpenAI from "openai";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class OpenAIClient implements ConnectedClient {
	constructor(public readonly openai: OpenAI) {}
}

export class OpenAIIntegration implements Integration<OpenAIClient, any> {
	readonly serviceId = Service.OpenAI;
	private client: OpenAI | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.apiKey) {
			throw new ConfigError("OpenAI API key is required");
		}
	}

	async connect(): Promise<OpenAIClient> {
		if (this.client) {
			return new OpenAIClient(this.client);
		}

		this.client = new OpenAI({
			apiKey: this.config.credentials.apiKey,
		});
		return new OpenAIClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.openai.models.list();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
