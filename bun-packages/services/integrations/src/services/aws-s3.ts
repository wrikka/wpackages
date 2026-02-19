import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import pRetry from "p-retry";
import { ApiError, AuthError, ConfigError } from "../error";
import type { ConnectedClient, Integration, ServiceConfig } from "../types/types";
import { AwsS3Credentials, Service } from "../types/types";
import { AwsS3CredentialsSchema } from "../types";

export class AwsS3Client implements ConnectedClient {
	constructor(public readonly s3: S3Client) { }
}

export class AwsS3Integration implements Integration<AwsS3Client, AwsS3Credentials> {
	readonly serviceId = Service.AwsS3;
	private client: S3Client | null = null;

	constructor(public config: ServiceConfig<AwsS3Credentials>) {
		const validation = AwsS3CredentialsSchema.safeParse(config.credentials);
		if (!validation.success) {
			throw new ConfigError("Invalid AWS S3 credentials");
		}
	}

	async connect(): Promise<AwsS3Client> {
		const { accessKeyId, secretAccessKey } = this.config.credentials;
		const { region } = this.config;

		if (!accessKeyId || !secretAccessKey) {
			throw new AuthError(this.serviceId, "Missing accessKeyId or secretAccessKey");
		}
		if (!region) {
			throw new ConfigError(`Region is required for ${this.serviceId}`);
		}

		if (this.client) {
			return new AwsS3Client(this.client);
		}

		const operation = async () => {
			this.client = new S3Client({
				region,
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
			});
			return new AwsS3Client(this.client);
		};

		try {
			return await pRetry(operation, {
				retries: this.config.retries ?? 3,
				onFailedAttempt: (error) => {
					console.warn(
						`AWS S3 connection attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`,
					);
				},
			});
		} catch (error) {
			if (error instanceof AuthError) {
				throw error;
			}
			throw new ApiError(this.serviceId, `Failed to connect to AWS S3 after multiple retries.`, error as Error);
		}
	}

	async verify(): Promise<{ success: boolean; error?: string }> {
		try {
			const client = await this.connect();
			const command = new ListBucketsCommand({});
			await client.s3.send(command);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
