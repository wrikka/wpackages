import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { Box, Text } from "../components";
import { Renderer, RendererLive } from "./renderer.service";
import { Terminal } from "./terminal.service";

describe("RendererLive with Layout", () => {
	it("should render a layout correctly", async () => {
		let output = "";
		const MockTerminal = Layer.succeed(
			Terminal,
			Terminal.of({
				write: (message) =>
					Effect.sync(() => {
						output = message;
					}),
				clear: Effect.sync(() => void 0),
				getSize: Effect.succeed({ rows: 10, columns: 50 }),
			}),
		);

		const testLayer = Layer.provide(RendererLive, MockTerminal);

		const program = Effect.gen(function*(_) {
			const renderer = yield* _(Renderer);
			const component = Box(
				{ flexDirection: "column", width: 50, height: 10 },
				[
					Box({ height: 3, borderStyle: "single" }, [Text({}, "Header")]),
					Box({ flexGrow: 1, borderStyle: "double", borderColor: "green" }, [
						Text({}, "Content"),
					]),
					Box({ height: 3, borderStyle: "single" }, [Text({}, "Footer")]),
				],
			);
			return yield* _(renderer.render(component));
		});

		const runnable = Effect.provide(program, testLayer) as Effect.Effect<void>;
		await Effect.runPromise(runnable);

		// A simple snapshot test to verify the output
		expect(output).toMatchSnapshot();
	});
});
