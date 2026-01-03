import { createConsoleLogger } from "@wpackages/observability";
import { Config } from "../config/app.config";
import { Effect } from "../lib/functional";

// Define the Logger interface based on the one from observability
export type Logger = ReturnType<typeof createConsoleLogger>;

// Create a context tag for the Logger service
export const Logger = Effect.tag<Logger>("Logger");

// Create a live layer that provides a real console logger, dependent on Config
export const LoggerLive = Effect.map(Effect.get(Config), (config) => ({
	[Logger.key]: createConsoleLogger({
		minLevel: config.logLevel,
		baseMeta: { service: "program" },
	}),
}));
