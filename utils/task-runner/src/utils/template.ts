import type { RunnerOptions } from "../types";
import { parseCommand } from "./parse";

/**
 * Tagged template literal for command execution
 * @example
 * ```ts
 * const name = "world";
 * const cmd = cmd`echo hello ${name}`;
 * // Returns: { command: "echo", args: ["hello", "world"] }
 * ```
 */
export const cmd = (
	strings: TemplateStringsArray,
	...values: readonly unknown[]
): Pick<RunnerOptions, "command" | "args"> => {
	// Build command string
	let commandString = "";
	for (let i = 0; i < strings.length; i++) {
		commandString += strings[i];
		if (i < values.length) {
			// Convert value to string and escape if needed
			const value = String(values[i]);
			commandString += value;
		}
	}

	// Parse the command string
	const parsed = parseCommand(commandString.trim());
	return {
		command: parsed.command,
		args: parsed.args,
	};
};

/**
 * Shell command template (automatically uses shell)
 */
export const sh = (
	strings: TemplateStringsArray,
	...values: readonly unknown[]
): RunnerOptions => {
	const { command, args } = cmd(strings, ...values);
	return {
		command,
		args: args ?? [],
		shell: true,
	};
};

/**
 * PowerShell command template (for Windows)
 */
export const ps = (
	strings: TemplateStringsArray,
	...values: readonly unknown[]
): RunnerOptions => {
	// Build full command string
	let commandString = "";
	for (let i = 0; i < strings.length; i++) {
		commandString += strings[i];
		if (i < values.length) {
			commandString += String(values[i]);
		}
	}

	return {
		command: "powershell",
		args: ["-Command", commandString.trim()],
	};
};

/**
 * Bash command template (for Unix)
 */
export const bash = (
	strings: TemplateStringsArray,
	...values: readonly unknown[]
): RunnerOptions => {
	// Build full command string
	let commandString = "";
	for (let i = 0; i < strings.length; i++) {
		commandString += strings[i];
		if (i < values.length) {
			commandString += String(values[i]);
		}
	}

	return {
		command: "bash",
		args: ["-c", commandString.trim()],
	};
};

/**
 * Create a reusable command template
 */
export const createTemplate = (
	template: string,
): (
	variables: Record<string, string>,
) => Pick<RunnerOptions, "command" | "args"> => {
	return (variables: Record<string, string>) => {
		let command = template;
		for (const [key, value] of Object.entries(variables)) {
			command = command.replace(new RegExp(`\\{${key}\\}`, "g"), value);
		}
		return parseCommand(command);
	};
};
