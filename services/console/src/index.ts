import { Context, Effect, Layer } from "effect";
import * as readline from "node:readline/promises";

export class ConsoleService extends Context.Tag("ConsoleService")<
	ConsoleService,
	{
		readonly log: (message: string) => Effect.Effect<void, never>;
		readonly readLine: (prompt: string) => Effect.Effect<string, Error>;
	}
>() {}

export const ConsoleServiceLive = Layer.succeed(
	ConsoleService,
	ConsoleService.of({
		log: (message) => Effect.sync(() => console.log(message)),
		readLine: (prompt) =>
			Effect.tryPromise({
				try: () => {
					const rl = readline.createInterface({
						input: process.stdin,
						output: process.stdout,
					});
					return rl.question(prompt).finally(() => rl.close());
				},
				catch: (e) => new Error(`Failed to read line: ${e}`),
			}),
	}),
);
