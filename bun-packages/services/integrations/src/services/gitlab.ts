import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class GitLabClient implements ConnectedClient {
	constructor(public readonly client: any) {}
}

export class GitLabIntegration implements Integration<GitLabClient, any> {
	readonly serviceId = Service.GitLab;
	private client: any = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("GitLab OAuth token is required");
		}
	}

	async connect(): Promise<GitLabClient> {
		if (this.client) {
			return new GitLabClient(this.client);
		}

		// Basic GitLab client implementation
		this.client = {
			token: this.config.credentials.oauth2Token,
			apiVersion: "v4",
		};
		return new GitLabClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.connect();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
