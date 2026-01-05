import { createConsoleLogger } from "@wpackages/observability";
import { Context, Effect, Layer } from "effect";
import { Config } from "../config/app.config";

// Define the Logger interface based on the one from observability
export type Logger = ReturnType<typeof createConsoleLogger>;

// Create a context tag for the Logger service
export const Logger = Context.GenericTag<Logger>("@wpackages/program/Logger");

// Create a live layer that provides a real console logger, dependent on Config
const makeLogger = Effect.map(Config, (config) =>
	Logger.of(
		createConsoleLogger({
			minLevel: config.logLevel,
			baseMeta: { service: "program" },
		}),
	));

export const LoggerLive = Layer.effect(Logger, makeLogger);
