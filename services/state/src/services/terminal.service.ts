import { Context, Effect, Layer } from "effect";

// 1. Define the service interface
export interface Terminal {
	readonly write: (message: string) => Effect.Effect<void>;
	readonly clear: Effect.Effect<void>;
	readonly getSize: Effect.Effect<{ rows: number; columns: number }>;
}

// 2. Create a stable Tag for the service using GenericTag
export const Terminal: Context.Tag<Terminal, Terminal> =
	Context.GenericTag<Terminal>("Terminal");

// 3. Create the live implementation as a Layer
export const TerminalLive: Layer.Layer<Terminal> = Layer.succeed(Terminal, {
	write: (message: string) => Effect.sync(() => process.stdout.write(message)),
	clear: Effect.sync(() => process.stdout.write("\u001b[2J\u001b[0;0H")),
	getSize: Effect.sync(() => ({
		rows: process.stdout.rows,
		columns: process.stdout.columns,
	})),
});
