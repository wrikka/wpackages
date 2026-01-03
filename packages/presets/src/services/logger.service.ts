import { Context, Effect, Layer } from "effect";

export interface Logger {
	readonly log: (message: string) => Effect.Effect<void, never>;
}

export const Logger = Context.Tag<Logger>("@wpackages/presets/Logger");

export const LoggerLive = Layer.succeed(
	Logger,
	{
		log: (message: string) => Effect.sync(() => console.log(message)),
	},
);
