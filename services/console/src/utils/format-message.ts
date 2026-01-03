import type { LogLevel, LogMessage } from "../types/index";

export const formatMessage = (level: LogLevel, message: LogMessage, context?: string) => {
	const timestamp = new Date().toISOString();
	const contextStr = context ? ` [${context}]` : "";
	const prefix = `[${timestamp}] [${level.toUpperCase()}]${contextStr}`;
	if (typeof message === "string") {
		return [`${prefix} ${message}`] as const;
	}
	return [prefix, message] as const;
};
