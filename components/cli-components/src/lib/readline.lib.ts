/**
 * Readline Library Wrapper
 * Wraps Node.js readline for easier testing
 */

import { createInterface as createReadlineInterface } from "node:readline";
import type { Interface } from "node:readline";

/**
 * Create readline interface
 */
export const createInterface = (): Interface =>
	createReadlineInterface({
		input: process.stdin,
		output: process.stdout,
	});

/**
 * Question helper
 */
export const askQuestion = (rl: Interface, question: string): Promise<string> =>
	new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
