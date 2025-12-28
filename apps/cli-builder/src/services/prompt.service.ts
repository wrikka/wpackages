import * as p from "@wrikka/prompt";
import { Effect } from "effect";
import type { Command, Option } from "../types";

const CANCELLATION = Symbol.for("cancel");

const askForOption = async (option: Option): Promise<string | symbol> => {
	let value: string | null = null;
	let valid = false;

	while (!valid) {
		const result = await p.text({
			message: option.description || `Enter value for ${option.name}`,
			placeholder: String(option.defaultValue || ""),
			initialValue: String(option.defaultValue || ""),
		});

		if (result === CANCELLATION) {
			return CANCELLATION;
		}

		if (option.required && !result) {
			// Using console.log as a replacement for p.note
			console.log("\x1b[31mThis field is required. Please try again.\x1b[0m");
		} else {
			value = result as string;
			valid = true;
		}
	}
	return value as string;
};

export const runPromptMode = (commands: ReadonlyArray<Command>) =>
	Effect.tryPromise(async () => {
		console.log("Welcome to the CLI!");

		const selectedCommandName = await p.select({
			message: "Which command would you like to run?",
			options: commands.map(c => ({ value: c.name, label: c.name, hint: c.description as string | undefined })),
		});

		if (selectedCommandName === CANCELLATION) {
			console.log("Operation cancelled.");
			return;
		}

		const command = commands.find(c => c.name === selectedCommandName);
		if (!command) {
			throw new Error("Command not found");
		}

		const args: Record<string, any> = {};
		if (command.options && command.options.length > 0) {
			for (const opt of command.options) {
				const key = opt.name.replace(/^--/, "");
				const value = await askForOption(opt);

				if (value === CANCELLATION) {
					console.log("Operation cancelled.");
					return;
				}
				args[key] = value;
			}
		}

		if (command.action) {
			console.log("Running command...");
			command.action(args);
		} else {
			console.warn(`Command '${command.name}' has no action. It might be a container for sub-commands.`);
		}
	});
