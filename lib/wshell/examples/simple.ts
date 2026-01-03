import { all as allBuiltins, CommandServiceLive } from "@wpackages/command";
import { ConsoleService, ConsoleServiceLive } from "@wpackages/console";
import { Effect, Layer } from "effect";
import { DisplayServiceLive } from "../src/services/display.service";
import { ExecutorService, ExecutorServiceLive } from "../src/services/executor.service";
import { ParserService, ParserServiceLive } from "../src/services/parser.service";

// 1. Create the full application layer, similar to index.ts
const CommandLive = CommandServiceLive(allBuiltins);
const DisplayLive = Layer.provide(DisplayServiceLive, ConsoleServiceLive);
const ServicesLive = Layer.provide(
	ExecutorServiceLive,
	Layer.mergeAll(CommandLive, DisplayLive),
);
const AppLive = Layer.mergeAll(
	ServicesLive,
	ConsoleServiceLive,
	ParserServiceLive,
	CommandLive,
	DisplayLive,
);

// 2. Define a simple program
const program = Effect.gen(function*() {
	const console = yield* ConsoleService;
	const parser = yield* ParserService;
	const executor = yield* ExecutorService;

	yield* console.log("Running a simple command...");

	const command = yield* parser.parse('ls');
	yield* executor.execute(command);

	yield* console.log("Done!");
});

// 3. Provide the layer and run the program
const runnable = program.pipe(Effect.provide(AppLive));

Effect.runPromise(runnable).catch((e) => {
	console.error("Example failed to run:", e);
	process.exit(1);
});
