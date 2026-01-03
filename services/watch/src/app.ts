import { Effect, Stream } from "effect";
import { log, watch } from "./services";

const program = watch(".").pipe(
	Stream.runForEach((event) => log(`Received event: ${JSON.stringify(event)}`)),
);

Effect.runPromise(program).catch(console.error);
