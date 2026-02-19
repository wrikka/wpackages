import { Effect } from "effect";
import { Terminal, TerminalLive } from "./services/terminal.service";

const main = Effect.gen(function* (_) {
	const terminal = yield* _(Terminal);

	yield* _(terminal.render("Hello from @wpackages/tui-react!"));
});

const runnable = Effect.provide(main, TerminalLive);

Effect.runPromise(runnable).catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
