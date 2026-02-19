# Service Integrations SDK

This project provides a unified, type-safe SDK for integrating with over 100 developer services. Built with TypeScript and powered by Bun, it offers a scalable and resilient architecture for managing third-party API connections.

Alongside the SDK, this repository includes a powerful dashboard built with Nuxt 4, allowing you to manage, test, and monitor all your service integrations from a single interface.

## Features

- **Type-Safe:** Leverages Zod for schema validation to ensure all configurations and credentials are correct.
- **Scalable:** A registry-based architecture allows for easy addition of new integrations.
- **Resilient:** Includes built-in retry logic for transient network errors.
- **Unified API:** A consistent interface (`connect`, `verify`) across all integrations.
- **Management Dashboard:** A Nuxt 4 application for managing connections, viewing logs, and generating code snippets.

## Getting Started

### 1. Installation

Install all necessary dependencies using Bun:

```bash
bun install
```

### 2. Dashboard Setup

The dashboard requires a Turso database for storing connection configurations and logs.

1. **Create `.env` file:** In the `dashboard/` directory, create a `.env` file with your Turso credentials:

   ```env
   TURSO_DATABASE_URL="your-turso-db-url"
   TURSO_AUTH_TOKEN="your-turso-auth-token"
   ```

2. **Run Database Migrations & Seed:**

   ```bash
   # From the `dashboard/` directory
   bun run db:migrate
   bun run db:seed
   ```

3. **Run the Dashboard:**

   ```bash
   # From the root `service-integrations/` directory
   bun run dev:dashboard
   ```

   The dashboard will be available at `http://localhost:3000`.

## SDK Usage Example

Here is a basic example of how to use the SDK to connect to GitHub and list repositories.

```typescript
import { IntegrationSdk, Service } from "./src";

const myConfig = {
	[Service.GitHub]: {
		credentials: {
			accessToken: process.env.GITHUB_ACCESS_TOKEN,
		},
	},
};

async function main() {
	try {
		const sdk = new IntegrationSdk(myConfig);
		const github = await sdk.getClient<any>(Service.GitHub);

		const repos = await github.listRepos();
		console.log("Successfully connected to GitHub and fetched repos:", repos);
	} catch (error) {
		console.error("SDK Error:", error);
	}
}

main();
```

## Implemented Integrations

The following table summarizes all the integrations that have been implemented in the SDK.

| Category                       | Service                | Dependency                       |
| :----------------------------- | :--------------------- | :------------------------------- |
| **Source Control & DevOps**    | GitHub                 | `@octokit/rest`                  |
|                                | GitLab                 | `@gitbeaker/rest`                |
|                                | Bitbucket              | `bitbucket`                      |
|                                | Vercel                 | `@vercel/node`                   |
|                                | Netlify                | `netlify`                        |
|                                | Cloudflare             | `cloudflare`                     |
| **Communication**              | Slack                  | `@slack/web-api`                 |
|                                | Discord                | `discord.js`                     |
|                                | Twilio                 | `twilio`                         |
|                                | SendGrid               | `@sendgrid/client`               |
|                                | Postmark               | `postmark`                       |
|                                | Mailgun                | `mailgun.js`                     |
|                                | Mailchimp              | `@mailchimp/mailchimp_marketing` |
| **Cloud & Infrastructure**     | AWS S3                 | `@aws-sdk/client-s3`             |
|                                | AWS Lambda             | `@aws-sdk/client-lambda`         |
|                                | AWS EC2                | `@aws-sdk/client-ec2`            |
|                                | AWS SQS                | `@aws-sdk/client-sqs`            |
|                                | Google Cloud Functions | `@google-cloud/functions`        |
| **Monitoring & Observability** | Sentry                 | (native fetch)                   |
| **Authentication**             | Auth0                  | `auth0`                          |
|                                | Okta                   | `@okta/okta-sdk-nodejs`          |
|                                | Clerk                  | `@clerk/backend`                 |
| **Database & Storage**         | PlanetScale            | `mysql2`                         |
|                                | Neon                   | `postgres`                       |
|                                | Supabase               | `@supabase/supabase-js`          |
| **Payments & Billing**         | Stripe                 | `stripe`                         |
|                                | PayPal                 | `@paypal/checkout-server-sdk`    |
| **AI & Machine Learning**      | OpenAI                 | `openai`                         |
| **Other Services**             | Shopify                | `@shopify/shopify-api-node`      |

To run the SDK:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.7. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
