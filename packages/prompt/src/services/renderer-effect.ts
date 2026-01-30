import { Context, Effect, Layer } from "effect";
import { Instance, render } from "ink";
import React from "react";

// 1. Define the service interface
export interface Renderer {
	readonly render: (node: React.ReactElement) => Effect.Effect<Instance>;
	readonly unmount: (instance: Instance) => Effect.Effect<undefined>;
}

export const Renderer = Context.GenericTag<Renderer>("app/Renderer");

// 3. Implement the Live Layer
export const RendererLive = Layer.succeed(
	Renderer,
	{
		render: (node: React.ReactElement) => Effect.sync(() => render(node)),
		unmount: (instance: Instance) =>
			Effect.sync(() => {
				instance.unmount();
				return undefined;
			}),
	},
);
