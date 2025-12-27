import { Effect, Option, Ref } from "effect";
import { pc } from "../lib";
import { AppState, type Key, Terminal } from "../services";
import type { TaskSource } from "../types";
import { MESSAGES } from "../constant";
import { runFzf } from "./fzf";

const renderHeader = Effect.gen(function*() {
	const app = yield* AppState;
	const terminal = yield* Terminal;
	const currentTabIndex = yield* Ref.get(app.currentTabIndex);
	const tabs = yield* app.tabs;
	const { columns } = yield* terminal.getTerminalSize;

	let output = "";
	output += `${pc.cyan(MESSAGES.HEADER)}\n`;
	output += `${pc.dim(MESSAGES.SUBTITLE)}\n\n`;

	for (let i = 0; i < tabs.length; i++) {
		const tab = tabs[i];
		if (i === currentTabIndex) {
			output += `${pc.magenta(`[ ${tab} ]`)}  `;
		} else {
			output += `${pc.dim(`[ ${tab} ]`)}  `;
		}
	}
	output += "\n";
	output += `${pc.dim("─".repeat(columns))}\n\n`;

	return output;
});

const renderFooter = Effect.succeed(
	`\n${pc.dim(MESSAGES.HELP)}`,
);

const switchTab = (direction: 1 | -1) =>
	Effect.gen(function*() {
		const app = yield* AppState;
		const tabs = yield* app.tabs;
		yield* Ref.update(app.currentTabIndex, i => (i + direction + tabs.length) % tabs.length);
	});

const handleAppInput = (key: Key) => {
	switch (key.name) {
		case "right":
		case "tab":
			return switchTab(1);
		case "left":
			return switchTab(-1);
		default:
			return Effect.void;
	}
};

export const runApp = (taskSources: TaskSource[]) =>
	Effect.gen(function*() {
		const app = yield* AppState;
		yield* Ref.set(app.taskSources, taskSources);

		while (true) {
			const header = yield* renderHeader;
			const footer = yield* renderFooter;
			const currentTasks = yield* app.currentTasks;

			// Clear screen and render header/footer
			const terminal = yield* Terminal;
			yield* terminal.clearScreen;
			yield* terminal.render(header + footer);

			const selectedTask = yield* runFzf(currentTasks);

			if (Option.isSome(selectedTask)) {
				// Handle selected task
				yield* terminal.clearScreen;
				yield* Effect.log(`Running task: ${selectedTask.value.name}`);
				// Here you would execute the task command
				return;
			} else {
				// Handle escape, check for tab switch keys
				const key = yield* terminal.readKey;
				yield* handleAppInput(key);
			}
		}
	});
