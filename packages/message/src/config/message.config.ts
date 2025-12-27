/**
 * Message Configuration
 * Settings for messaging service behavior
 */

export const MESSAGE_CONFIG = {
	// Message delivery
	retryAttempts: 3,
	retryDelay: 1000,
	timeout: 30000,

	// Message validation
	validateInputs: true,
	maxMessageLength: 10000,

	// Message logging
	logMessages: false,
	logLevel: "info" as const,

	// Message channels
	enabledChannels: ["email", "sms", "push", "in-app"] as const,
	defaultChannel: "email" as const,
} as const;

export type MessageConfig = typeof MESSAGE_CONFIG;
