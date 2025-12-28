import { Effect } from "effect";

// Component Interface
export interface Graphic {
	readonly draw: Effect.Effect<string>;
}

// Leaf: A simple graphic element
export const createDot = (x: number, y: number): Graphic => ({
	draw: Effect.sync(() => `Drawing a dot at (${x}, ${y})`),
});

// Composite: A group of graphics
export const createCompoundGraphic = (...children: Graphic[]): Graphic => ({
	draw: Effect.gen(function*() {
		const results = yield* Effect.all(children.map((child) => child.draw));
		return `Drawing a compound graphic:\n${results.join("\n")}`;
	}),
});
