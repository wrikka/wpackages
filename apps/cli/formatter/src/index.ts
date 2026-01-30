import { Effect } from "effect";
import { runFormatterApp } from "./app";

Effect.runPromise(runFormatterApp(process.argv.slice(2))).catch((error) => {
	console.error(error);
	process.exit(1);
});
