/**
 * Global Configuration System
 * ระบบ config กลางสำหรับ API integrations
 */

export interface GlobalIntegrationConfig {
	/** SendGrid configuration */
	sendgrid?: {
		apiKey?: string;
		defaultFrom?: string;
		defaultFromName?: string;
	};
	/** Stripe configuration */
	stripe?: {
		apiKey?: string;
		apiVersion?: string;
		defaultCurrency?: string;
	};
	/** Global defaults */
	defaults?: {
		timeout?: number;
		retryAttempts?: number;
	};
}

class GlobalConfigManager {
	private config: GlobalIntegrationConfig = {};
	private initialized = false;

	/**
	 * ตั้งค่า global config
	 */
	configure(config: GlobalIntegrationConfig): void {
		this.config = { ...this.config, ...config };
		this.initialized = true;
	}

	/**
	 * ดึงค่า config
	 */
	get<K extends keyof GlobalIntegrationConfig>(
		key: K,
	): GlobalIntegrationConfig[K] {
		return this.config[key];
	}

	/**
	 * ดึงค่า config ทั้งหมด
	 */
	getAll(): GlobalIntegrationConfig {
		return { ...this.config };
	}

	/**
	 * Reset config
	 */
	reset(): void {
		this.config = {};
		this.initialized = false;
	}

	/**
	 * ตรวจสอบว่า initialized หรือยัง
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Auto-configure จาก environment variables
	 */
	autoConfigureFromEnv(): void {
		const config: GlobalIntegrationConfig = {};

		// SendGrid
		if (process.env["SENDGRID_API_KEY"]) {
			config.sendgrid = {
				...(process.env["SENDGRID_API_KEY"] && { apiKey: process.env["SENDGRID_API_KEY"] }),
				...(process.env["SENDGRID_FROM_EMAIL"] && { defaultFrom: process.env["SENDGRID_FROM_EMAIL"] }),
				...(process.env["SENDGRID_FROM_NAME"] && { defaultFromName: process.env["SENDGRID_FROM_NAME"] }),
			};
		}

		// Stripe
		if (process.env["STRIPE_API_KEY"]) {
			config.stripe = {
				...(process.env["STRIPE_API_KEY"] && { apiKey: process.env["STRIPE_API_KEY"] }),
				...(process.env["STRIPE_API_VERSION"] && { apiVersion: process.env["STRIPE_API_VERSION"] }),
				...(process.env["STRIPE_DEFAULT_CURRENCY"] && { defaultCurrency: process.env["STRIPE_DEFAULT_CURRENCY"] }),
				...(!process.env["STRIPE_DEFAULT_CURRENCY"] && { defaultCurrency: "usd" }),
			};
		}

		// Defaults
		config.defaults = {
			...(process.env["API_TIMEOUT"] && { timeout: Number(process.env["API_TIMEOUT"]) }),
			...(!process.env["API_TIMEOUT"] && { timeout: 30000 }),
			...(process.env["API_RETRY_ATTEMPTS"] && { retryAttempts: Number(process.env["API_RETRY_ATTEMPTS"]) }),
			...(!process.env["API_RETRY_ATTEMPTS"] && { retryAttempts: 3 }),
		};

		this.configure(config);
	}
}

// Singleton instance
export const globalConfig = new GlobalConfigManager();

/**
 * ตั้งค่า global config (shorthand)
 */
export const configureIntegrations = (
	config: GlobalIntegrationConfig,
): void => {
	globalConfig.configure(config);
};

/**
 * Auto-configure จาก env (shorthand)
 */
export const autoConfigureFromEnv = (): void => {
	globalConfig.autoConfigureFromEnv();
};
