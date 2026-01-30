import { Effect, Option, Ref, Stream } from "effect";
import { MESSAGES, UI_DEFAULTS } from "../constant";
import { pc } from "../lib";
import { FzfState, type Key, Terminal } from "../services";
import type { Task } from "../types";
import { calculateListHeight, calculateVisibleRange, formatDisplayWithPadding } from "@wpackages/tui-react";

const renderFzf = Effect.gen(function*() {
	const terminal = yield* Terminal;
	const fzf = yield* FzfState;

	const query = yield* Ref.get(fzf.query);
	const selectedIndex = yield* Ref.get(fzf.selectedIndex);
	const results = yield* fzf.results;
	const { rows, columns } = yield* terminal.getTerminalSize;

	const listHeight = calculateListHeight(rows, UI_DEFAULTS.HEADER_HEIGHT, UI_DEFAULTS.FOOTER_HEIGHT);
	const { startIndex, endIndex } = calculateVisibleRange(selectedIndex, listHeight, results.length);
	const visibleResults = results.slice(startIndex, endIndex);

	let output = "";
	output += `${pc.yellow(MESSAGES.SEARCH_LABEL)}${query}\n`;
	output += `${pc.dim("─".repeat(columns))}\n\n`;

	if (visibleResults.length > 0) {
		const maxNameLength = Math.max(...results.map(t => t.name.length));

		for (let i = 0; i < visibleResults.length; i++) {
			const task = visibleResults[i];
			if (task) {
				const isSelected = startIndex + i === selectedIndex;
				const { padding } = formatDisplayWithPadding(task.name, task.command, maxNameLength);

				if (isSelected) {
					output += `${pc.magenta(`> ${task.name}`)}${pc.dim(`${padding}${task.command}`)}\n`;
				} else {
					output += `  ${task.name}${pc.dim(`${padding}${task.command}`)}\n`;
				}
			}
		}
	} else if (query.length > 0) {
		output += `No matches for "${pc.yellow(query)}"\n`;
	}

	return terminal.render(output);
});

const handleFzfInput = (key: Key) =>
	Effect.gen(function*() {
		const fzf = yield* FzfState;
		const results = yield* fzf.results;

		switch (key.name) {
			case "up":
				return yield* Ref.update(fzf.selectedIndex, prev => Math.max(0, prev - 1));
			case "down":
				return yield* Ref.update(fzf.selectedIndex, prev => Math.min(results.length - 1, prev + 1));
			case "backspace":
				return yield* Ref.update(fzf.query, prev => prev.slice(0, -1));
			default:
				if (key.char && key.char.length === 1 && !key.ctrl && !key.meta) {
					return yield* Ref.update(fzf.query, prev => prev + key.char);
				}
				return Effect.void;
		}
	});

export const runFzf = (initialItems: Task[]) =>
	Effect.gen(function*() {
		const terminal = yield* Terminal;
		const fzf = yield* FzfState;

		yield* Ref.set(fzf.items, initialItems);
		yield* Ref.set(fzf.query, "");
		yield* Ref.set(fzf.selectedIndex, 0);

		const keyPress$ = Stream.repeatEffect(terminal.readKey);

		const render$ = Stream.merge(
			Stream.make(void 0), // Initial render
			keyPress$,
		).pipe(Stream.runForEach(() => renderFzf));

		const input$ = keyPress$.pipe(
			Stream.tap(handleFzfInput),
			Stream.takeUntil(key => key.name === "escape" || key.name === "return"),
			Stream.runDrain,
		);

		yield* Effect.all([render$, input$], { concurrency: "unbounded" });

		const selectedIndex = yield* Ref.get(fzf.selectedIndex);
		const results = yield* fzf.results;
		return Option.fromNullable(results[selectedIndex]);
	});
