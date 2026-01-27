import { Context, Effect, Layer, Queue } from "effect";
import * as readline from "node:readline";
import { ANSI, TERMINAL_DEFAULTS } from "../constant";

export interface Key {
	readonly name: string;
	readonly ctrl: boolean;
	readonly meta: boolean;
	readonly shift: boolean;
	readonly char: string | undefined;
}

export interface Terminal {
	readonly clearScreen: Effect.Effect<void>;
	readonly moveCursor: (x: number, y: number) => Effect.Effect<void>;
	readonly clearLine: Effect.Effect<void>;
	readonly showCursor: Effect.Effect<void>;
	readonly hideCursor: Effect.Effect<void>;
	readonly getTerminalSize: Effect.Effect<{ rows: number; columns: number }>;
	readonly render: (content: string) => Effect.Effect<void>;
	readonly readKey: Effect.Effect<Key>;
	readonly cleanup: Effect.Effect<void>;
}

export const Terminal: Context.Tag<Terminal, Terminal> =
	Context.GenericTag<Terminal>("Terminal");

const write = (text: string): Effect.Effect<void> =>
	Effect.sync(() => process.stdout.write(text));

const getSize = (): { rows: number; columns: number } => ({
	rows: process.stdout.rows || TERMINAL_DEFAULTS.DEFAULT_ROWS,
	columns: process.stdout.columns || TERMINAL_DEFAULTS.DEFAULT_COLUMNS,
});

const disableRawMode = (): Effect.Effect<void> =>
	Effect.sync(() => {
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(false);
		}
	});

export const TerminalLive: Layer.Layer<Terminal> = Layer.effect(
	Terminal,
	Effect.gen(function* () {
		const rl = yield* Effect.sync(() =>
			readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			}),
		);

		const keyQueue = yield* Queue.unbounded<Key>();

		const keypressHandler = (_: unknown, key: readline.Key) => {
			Queue.unsafeOffer(keyQueue, {
				name: key.name || "",
				ctrl: key.ctrl || false,
				meta: key.meta || false,
				shift: key.shift || false,
				char: key.sequence,
			});
		};

		yield* Effect.acquireRelease(
			Effect.sync(() => {
				readline.emitKeypressEvents(process.stdin);
				process.stdin.on("keypress", keypressHandler);
				if (process.stdin.isTTY) {
					process.stdin.setRawMode(true);
				}
				process.stdout.write(ANSI.HIDE_CURSOR);
			}),
			() =>
				Effect.sync(() => {
					process.stdin.removeListener("keypress", keypressHandler);
					if (process.stdin.isTTY) {
						process.stdin.setRawMode(false);
					}
					process.stdout.write(ANSI.SHOW_CURSOR);
					rl.close();
				}),
		);

		return {
			clearScreen: write(ANSI.CLEAR_SCREEN),
			moveCursor: (x: number, y: number) => write(ANSI.moveCursor(x, y)),
			clearLine: write(ANSI.CLEAR_LINE),
			showCursor: write(ANSI.SHOW_CURSOR),
			hideCursor: write(ANSI.HIDE_CURSOR),
			getTerminalSize: Effect.sync(getSize),
			render: (content: string) =>
				Effect.gen(function* () {
					yield* write(ANSI.CLEAR_SCREEN);
					yield* write(ANSI.moveCursor(1, 1));
					yield* write(content);
				}),
			readKey: Queue.take(keyQueue),
			cleanup: Effect.gen(function* () {
				yield* disableRawMode();
				yield* write(ANSI.SHOW_CURSOR);
				yield* Effect.sync(() => rl.close());
			}),
		};
	}),
);
