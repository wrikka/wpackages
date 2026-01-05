import "dotenv/config";
import { BunRuntime } from "@effect/platform-bun";
import { ConsoleSpanExporter, init, SimpleSpanProcessor } from "@wpackages/tracing";
import { Effect, Fiber, Layer } from "effect";
import { main } from "./app";
import { loadEnv } from "./config/env";

const env = loadEnv();

if (env.ENABLE_TRACING) {
	void init({
		spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
	});
}

const program = Effect.gen(function*() {
	const fiber = yield* Effect.fork(Layer.launch(main));

	yield* Effect.sync(() => {
		if (typeof process?.on !== "function") return;

		const shutdown = () => {
			Fiber.interrupt(fiber).pipe(Effect.runFork);
		};

		process.on("SIGINT", shutdown);
		process.on("SIGTERM", shutdown);
	});

	yield* Fiber.join(fiber);
});

BunRuntime.runMain(program);
