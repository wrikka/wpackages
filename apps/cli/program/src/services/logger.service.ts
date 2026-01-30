import { ConsoleLive, Logger as BaseLogger, LoggerConfigTag, LoggerLive as BaseLoggerLive } from "@wpackages/logger";
import { Context, Effect, Layer } from "effect";
import { Config } from "../config/app.config";

export type Logger = Context.Tag.Service<typeof BaseLogger>;

export const Logger = BaseLogger;

const LoggerConfigLive = Layer.effect(
	LoggerConfigTag,
	Effect.map(Config, (config) => ({
		minLevel: config.logLevel,
		baseMeta: { service: "program" },
	})),
);

export const LoggerLive = BaseLoggerLive.pipe(Layer.provide(ConsoleLive), Layer.provide(LoggerConfigLive));
