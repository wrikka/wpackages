import type { IntegrationError } from "./integration";

type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Webhook configuration
 */
export type WebhookConfig = {
	readonly url: string;
	readonly events: readonly string[];
	readonly secret?: string;
	readonly headers?: Record<string, string>;
	readonly active?: boolean;
	readonly verifySSL?: boolean;
};

/**
 * Webhook event
 */
export type WebhookEvent<T = unknown> = {
	readonly id: string;
	readonly type: string;
	readonly timestamp: number;
	readonly data: T;
	readonly metadata?: Record<string, unknown>;
};

/**
 * Webhook signature verification
 */
export type SignatureVerification = {
	readonly algorithm: "sha256" | "sha1" | "md5";
	readonly header?: string;
	readonly secret: string;
};

/**
 * Webhook handler
 */
export type WebhookHandler<T = unknown> = (
	event: WebhookEvent<T>,
) => Promise<ResultType<void, IntegrationError>>;

/**
 * Webhook registration result
 */
export type WebhookRegistration = {
	readonly id: string;
	readonly url: string;
	readonly events: readonly string[];
	readonly active: boolean;
	readonly createdAt: number;
};
