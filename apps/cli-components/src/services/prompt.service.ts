/**
 * Prompt Service
 * High-level prompt operations combining input/output
 */

import * as Input from "./input.service";
import * as Output from "./output.service";

/**
 * Ask a simple question
 */
export const ask = async (prompt: string): Promise<string> => {
	Output.write(prompt);
	return await Input.question(prompt);
};

/**
 * Ask with validation loop
 */
export const askWithValidation = async <T>(
	promptText: string,
	parser: (input: string) => T,
	validator?: (value: T) => boolean | string,
): Promise<T> => {
	while (true) {
		const input = await ask(promptText);
		const value = parser(input);

		if (validator) {
			const result = validator(value);
			if (result !== true) {
				const error = typeof result === "string" ? result : "Invalid input";
				Output.writeLine(`  Error: ${error}`);
				continue;
			}
		}

		return value;
	}
};

/**
 * Confirm action
 */
export const confirm = async (
	message: string,
	defaultValue = false,
): Promise<boolean> => {
	const suffix = defaultValue ? " (Y/n): " : " (y/N): ";
	const input = await ask(message + suffix);

	if (!input.trim()) return defaultValue;

	const normalized = input.toLowerCase();
	return normalized === "y" || normalized === "yes";
};
