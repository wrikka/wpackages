import { ConfigError, ValidationError } from "./error";
import { getIntegrationImplementation } from "./lib";
import { SdkConfig, SdkConfigSchema, Service } from "./types";

// Import all integration files to ensure they register themselves
import "./services/github";
import "./services/gitlab";
import "./services/bitbucket";
import "./services/vercel";
import "./services/netlify";
import "./services/cloudflare";
import "./services/slack";
import "./services/discord";
import "./services/twilio";
import "./services/sendgrid";
import "./services/postmark";
import "./services/mailgun";
import "./services/mailchimp";
import "./services/aws-lambda";
import "./services/aws-ec2";
import "./services/aws-sqs";
import "./services/aws-s3";
import "./services/google-cloud-functions";
import "./services/sentry";
import "./services/auth0";
import "./services/okta";
import "./services/clerk";
import "./services/planetscale";
import "./services/neon";
import "./services/supabase";
import "./services/paypal";
import "./services/openai";
import "./services/shopify";
import "./services/stripe";

/**
 * The main SDK class for managing and accessing service integrations.
 */
export class IntegrationSdk {
	private config: SdkConfig;
	private instances: Map<Service, any> = new Map();
	private connectedClients: Map<Service, any> = new Map();

	/**
	 * Creates an instance of the IntegrationSdk.
	 * @param config - The SDK configuration for all services.
	 */
	constructor(config: SdkConfig) {
		const validationResult = SdkConfigSchema.safeParse(config);
		if (!validationResult.success) {
			throw new ValidationError("Invalid SDK configuration", validationResult.error.issues);
		}
		this.config = validationResult.data;
	}

	/**
	 * Gets an instance of an integration for a specific service.
	 * It will create a new instance if it doesn't exist.
	 *
	 * @template T The expected type of the integration instance.
	 * @param service - The service to get the instance for.
	 * @returns The integration instance.
	 * @throws {Error} if the service is not supported or has not been registered.
	 */
	private get<T extends Service>(service: T): any {
		// Return cached instance if it exists
		if (this.instances.has(service)) {
			return this.instances.get(service) as any;
		}

		const config = this.config[service];
		if (!config) {
			throw new Error(`Configuration for service '${service}' not found.`);
		}

		const IntegrationClass = getIntegrationImplementation(service);
		if (!IntegrationClass) {
			throw new Error(`Service '${service}' is not supported or has not been registered.`);
		}

		const instance = new IntegrationClass(config);
		this.instances.set(service, instance);

		return instance as any;
	}

	/**
	 * Gets a connected client for a specific service.
	 * It will connect if not already connected (lazy connection).
	 *
	 * @template TClient The expected type of the connected client.
	 * @param service - The service to get the client for.
	 * @returns A promise that resolves to the connected client instance.
	 * @throws {ConfigError} if the service is not registered or configured.
	 */
	public async getClient<TClient>(service: Service): Promise<TClient> {
		if (this.connectedClients.has(service)) {
			return this.connectedClients.get(service) as TClient;
		}

		const integration = this.get(service);
		if (!integration) {
			throw new ConfigError(`Service '${service}' is not registered in the SDK.`);
		}

		const serviceConfig = this.config[service];
		if (!serviceConfig || !serviceConfig.credentials) {
			throw new ConfigError(`Configuration or credentials for service '${service}' are missing.`);
		}

		const client = await integration.connect();
		this.connectedClients.set(service, client);

		return client as TClient;
	}
}

// Example usage (for demonstration)

// const myConfig: SdkConfig = {
//   [Service.GitHub]: {
//     credentials: { oauth2Token: 'ghp_...' },
//   },
//   [Service.AwsS3]: {
//     region: 'us-east-1',
//     credentials: {
//       accessKeyId: '...',
//       secretAccessKey: '...'
//     },
//   },
// };

// async function main() {
//   try {
//     const sdk = new IntegrationSdk(myConfig);
//     const githubClient = await sdk.getClient<any>(Service.GitHub);
//     console.log('Successfully connected to GitHub!');

//     const s3Client = await sdk.getClient<any>(Service.AwsS3);
//     console.log('Successfully connected to AWS S3!');
//   } catch (error) {
//     console.error('SDK Error:', error);
//   }
// }

// main();
