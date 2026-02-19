import { Octokit } from "@octokit/rest";
import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { Service } from "../types/types";

export class GitHubClient implements ConnectedClient {
	constructor(public readonly octokit: Octokit) {}
}

export class GitHubIntegration implements Integration<GitHubClient, any> {
	readonly serviceId = Service.GitHub;
	private client: Octokit | null = null;

	constructor(public config: ServiceConfig<any>) {
		if (!config.credentials?.oauth2Token) {
			throw new ConfigError("GitHub OAuth token is required");
		}
	}

	async connect(): Promise<GitHubClient> {
		if (this.client) {
			return new GitHubClient(this.client);
		}

		this.client = new Octokit({
			auth: this.config.credentials.oauth2Token,
		});

		return new GitHubClient(this.client);
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			await client.octokit.rest.users.getAuthenticated();
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
