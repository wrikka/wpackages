import { Effect } from "effect";
import { renderHelp, renderScriptList, renderScriptResults } from "./components";
import { ScriptRunnerService, ScriptRunnerServiceLive } from "./services";

/**
 * Application layer
 */
const AppLayer = ScriptRunnerServiceLive;

/**
 * Main application program
 */
const program = Effect.gen(function*() {
	const args = process.argv.slice(2);
	const command = args[0];
	const scriptName = args[1];

	const scriptRunner = yield* ScriptRunnerService;

	switch (command) {
		case "list": {
			const scripts = yield* scriptRunner.listScripts();
			console.log(renderScriptList(scripts));
			break;
		}

		case "run": {
			if (!scriptName) {
				console.error("Error: Script name is required");
				console.log(renderHelp());
				return yield* Effect.fail(new Error("Script name required"));
			}

			const result = yield* scriptRunner.runScriptByName(scriptName);
			console.log(renderScriptResults([result]));
			break;
		}

		case "run-all": {
			const allScripts = yield* scriptRunner.listScripts();
			const results = yield* scriptRunner.runScripts(allScripts);
			console.log(renderScriptResults(results));
			break;
		}

		case "help":
		case "--help":
		case "-h":
		default: {
			console.log(renderHelp());
			break;
		}
	}

	return "done";
});

/**
 * Run the application
 */
export const runApp = () =>
	program.pipe(
		Effect.provide(AppLayer),
		Effect.catchAll((error: unknown) =>
			Effect.sync(() => {
				console.error("Application error:", error);
				process.exit(1);
			})
		),
	);
