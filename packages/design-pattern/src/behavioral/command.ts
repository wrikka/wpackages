/**
 * Command Pattern - Pure functional implementation
 */

import type { Command } from "../types";

export const createCommand = <TResult = void>(
	execute: () => TResult,
	undo?: () => TResult,
): Command<TResult> => ({
	execute,
	...(undo && { undo }),
});

export const createCommandInvoker = <TResult = void>() => {
	const history: Array<Command<TResult>> = [];
	let currentIndex = -1;

	return {
		execute: (command: Command<TResult>): TResult => {
			const result = command.execute();
			history.splice(currentIndex + 1);
			history.push(command);
			currentIndex++;
			return result;
		},
		undo: (): TResult | undefined => {
			if (currentIndex >= 0) {
				const command = history[currentIndex];
				if (command) {
					currentIndex--;
					return command.undo?.();
				}
			}
		},
		redo: (): TResult | undefined => {
			if (currentIndex < history.length - 1) {
				currentIndex++;
				const command = history[currentIndex];
				if (command) {
					return command.execute();
				}
			}
		},
		clear: () => {
			history.length = 0;
			currentIndex = -1;
		},
	};
};

export const createMacroCommand = <TResult = void>(
	commands: ReadonlyArray<Command<TResult>>,
): Command<readonly TResult[]> => ({
	execute: () => commands.map((cmd) => cmd.execute()),
	undo: () => [...commands].reverse().map((cmd) => cmd.undo?.() as TResult),
});
