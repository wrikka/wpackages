/**
 * Input Service
 * Handles keyboard input and events (with side effects)
 */

import { createInterface } from "node:readline";
import { emitKeypressEvents } from "node:readline";

/**
 * Setup raw mode for keypress events
 */
export const setupRawMode = (): void => {
	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
	}
	emitKeypressEvents(process.stdin);
};

/**
 * Cleanup raw mode
 */
export const cleanupRawMode = (): void => {
	if (process.stdin.isTTY) {
		process.stdin.setRawMode(false);
	}
	process.stdin.removeAllListeners("keypress");
};

/**
 * Question via readline
 */
export const question = (prompt: string): Promise<string> => {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(prompt, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
};

/**
 * Listen to keypress events
 */
export const onKeypress = (
	handler: (
		str: string | undefined,
		key: { name: string; ctrl?: boolean; meta?: boolean },
	) => void,
): void => {
	process.stdin.on("keypress", handler);
};

/**
 * Remove keypress listener
 */
export const offKeypress = (): void => {
	process.stdin.removeAllListeners("keypress");
};
