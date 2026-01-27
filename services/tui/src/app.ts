import { Effect } from "effect";
import { Terminal, TerminalLive } from "./services/terminal.service";

const main = Effect.gen(function* () {
	const terminal = yield* Terminal;

	yield* terminal.render("Hello from @wpackages/tui-react!");
});

const runnable = Effect.provide(main, TerminalLive);

Effect.runPromise(runnable);
