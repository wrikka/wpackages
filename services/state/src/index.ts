import { Effect, Layer } from "effect";
import { Renderer, RendererLive } from "./services/renderer.service";
import type { Terminal } from "./services/terminal.service";
import { TerminalLive } from "./services/terminal.service";
import type { VNode } from "./types/vnode";

// Re-export components for users
export { Box } from "./components/Box";
export { Text } from "./components/Text";

// The main render function for users
export const render = (node: VNode): Effect.Effect<void, never, Terminal> => {
	const program = Effect.gen(function* (_) {
		const renderer = yield* _(Renderer);
		yield* _(renderer.render(node));
	});

	const MainLayer = Layer.provide(RendererLive, TerminalLive);
	return Effect.provide(program, MainLayer);
};
