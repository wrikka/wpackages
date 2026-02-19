import { ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types";
import { Service, AwsEc2Credentials } from "../types";

export class AwsEc2Client implements ConnectedClient {
	constructor(public readonly credentials: AwsEc2Credentials) {}
}

export class AwsEc2Integration implements Integration<AwsEc2Client, AwsEc2Credentials> {
	readonly serviceId = Service.AwsEc2;
	private client: AwsEc2Client | null = null;
	
	constructor(public config: ServiceConfig<AwsEc2Credentials>) {
		if (!config.credentials?.accessKeyId || !config.credentials?.secretAccessKey) {
			throw new ConfigError("AWS EC2 Access Key ID and Secret Access Key are required");
		}
	}
	
	async connect(): Promise<AwsEc2Client> {
		if (this.client) return this.client;
		this.client = new AwsEc2Client(this.config.credentials);
		return this.client;
	}
	
	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			await this.connect();
			return { success: true };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
		}
	}
}
