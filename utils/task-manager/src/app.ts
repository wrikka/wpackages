import { Console, Effect, Layer } from "effect";
import { runApp } from "./components";
import { AppStateLive, FzfStateLive, loadAllTasks, TerminalLive } from "./services";

const MainLive = Layer.mergeAll(AppStateLive, FzfStateLive, TerminalLive);

export const main = Effect.gen(function*() {
	const taskSources = yield* loadAllTasks;
	if (taskSources.length === 0) {
		return yield* Console.log("No tasks found.");
	}

	const program = runApp(taskSources);
	return yield* Effect.provide(program, MainLive);
});
