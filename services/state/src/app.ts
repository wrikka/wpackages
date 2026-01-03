import { Effect, Layer, Runtime } from "effect";
import { createEffect, createSignal } from "packages/signal/src";
import { Box } from "./components/Box";
import { Text } from "./components/Text";
import { Renderer, RendererLive } from "./services/renderer.service";
import { type Terminal, TerminalLive } from "./services/terminal.service";

const main = Effect.gen(function* (_) {
	// 1. Create reactive state
	const [counter, setCounter] = createSignal(0);

	// 2. Define the UI
	const App = () =>
		Box({ borderStyle: "rounded" }, [
			Text({ color: "green" }, `Counter: ${counter()}`),
		]);

	// 3. Get the renderer service and runtime
	const renderer = yield* _(Renderer);
	const runtime = yield* _(Effect.runtime<Renderer | Terminal>());
	const run = Runtime.runPromise(runtime);

	// 4. Create a reactive effect for rendering
	createEffect(() => {
		const ui = App();
		run(renderer.render(ui));
	});

	// 5. Start the counter
	setInterval(() => {
		setCounter(counter() + 1);
	}, 1000);

	// 6. Keep the process alive
	yield* _(Effect.never);
});

// Setup and run the program
const MainLayer = Layer.provideMerge(RendererLive, TerminalLive);
const runnable = Effect.provide(main, MainLayer);

Effect.runPromise(runnable);
