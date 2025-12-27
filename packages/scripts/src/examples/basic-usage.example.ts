/**
 * Basic Usage Example
 *
 * This example demonstrates how to use the scripts package
 * to manage and run scripts in a functional way.
 */

import { Effect } from "effect";
import { renderScriptResults } from "../components";
import { ScriptRunnerService } from "../services";

// Example of running a script programmatically
const runScriptExample = Effect.gen(function*() {
	console.log("Running script example...");

	const scriptRunner = yield* ScriptRunnerService;

	// List available scripts
	const scripts = yield* scriptRunner.listScripts();
	console.log(`Found ${scripts.length} scripts`);

	// Run a specific script by name
	try {
		const result = yield* scriptRunner.runScriptByName("example-script");
		console.log(renderScriptResults([result]));
	} catch (error) {
		console.error("Failed to run script:", error);
	}
});


// Run the examples (commented out as this is an example file)
// Effect.runPromise(Effect.all([runScriptExample, runMultipleScriptsExample]))
// 	.then(() => console.log("\nExamples completed!"))
// 	.catch((error) => console.error("Error running examples:", error));

export default runScriptExample;
