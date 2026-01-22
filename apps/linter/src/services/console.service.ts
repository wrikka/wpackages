import { Effect } from "effect";

export const makeConsoleService = () => ({
	log: (message: string): Effect.Effect<void, never> => Effect.sync(() => console.log(message)),
});

export const ConsoleService = makeConsoleService();
