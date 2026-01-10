import { Context, Effect, Layer } from "effect";
import { Schema } from "@effect/schema";

export class Command extends Schema.Class<Command>("Command")({
	name: Schema.String,
	args: Schema.Array(Schema.String),
}) {}

export type ShellValue = string | Array<Record<string, unknown>> | void;

export class CommandService extends Context.Tag("CommandService")<
	CommandService,
	{
		readonly lookup: (command: Command) => Effect.Effect<Command, never>;
		readonly list: () => Effect.Effect<Command[], never>;
	}
>() {}

export const CommandServiceLive = Layer.effect(
	CommandService,
	Effect.sync(() => {
		const builtins = new Map<string, Command>();

		return CommandService.of({
			lookup: (command) =>
				Effect.sync(() => {
					return builtins.get(command.name) ?? command;
				}),
			list: () =>
				Effect.sync(() => {
					return Array.from(builtins.values());
				}),
		});
	}),
);

/**
 * Array of all built-in commands.
 * Register commands here to make them available via CommandService.
 */
export const all: Command[] = [];
