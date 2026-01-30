import type { LoggerConfig, LogLevel } from "./types";

export const DEFAULT_MIN_LEVEL: LogLevel = "info";

export const DEFAULT_REDACT_KEYS = ["token", "password", "secret", "apiKey", "apiKeySecret", "authorization"] as const;

export const DEFAULT_CONFIG: LoggerConfig = {
	minLevel: DEFAULT_MIN_LEVEL,
	redactKeys: DEFAULT_REDACT_KEYS,
};

export const createConfig = (overrides?: Partial<LoggerConfig>): LoggerConfig => ({
	...DEFAULT_CONFIG,
	...overrides,
});
