import { Console, type Effect } from "effect";

export const log = (message: string): Effect.Effect<void> =>
	Console.log(message);
