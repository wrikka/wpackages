import { distance } from "fastest-levenshtein";
import type { CliConfig, Command } from "../types";

const getAllCommandNames = (commands: ReadonlyArray<Command>): string[] => {
	const names: string[] = [];
	for (const cmd of commands) {
		names.push(cmd.name);
		if (cmd.subCommands) {
			names.push(...getAllCommandNames(cmd.subCommands as Command[]));
		}
	}
	return names;
};

const findClosestCommand = (commandName: string, allCommands: string[]): string | undefined => {
	let closestCommand: string | undefined;
	let minDistance = 2; // Set a threshold for suggestions

	for (const cmd of allCommands) {
		const d = distance(commandName, cmd);
		if (d < minDistance) {
			minDistance = d;
			closestCommand = cmd;
		}
	}

	return closestCommand;
};

export const parseArguments = (
	argv: string[],
	config: CliConfig,
): { command: Command; args: Record<string, any> } => {
	let commands = config.commands;
	let command: Command | undefined;
	let argIndex = 2;

	while (argIndex < argv.length) {
		const currentArg = argv[argIndex];
		if (!currentArg) {
			break;
		}
		if (currentArg.startsWith("-")) {
			break; // Stop parsing commands when options start
		}
		const foundCommand = commands.find(c => c.name === currentArg);

		if (foundCommand) {
			command = foundCommand;
			if (foundCommand.subCommands && foundCommand.subCommands.length > 0) {
				commands = foundCommand.subCommands;
				argIndex++;
			} else {
				argIndex++;
				break;
			}
		} else {
			const allCommandNames = getAllCommandNames(config.commands);
			const suggestion = findClosestCommand(currentArg, allCommandNames);
			if (suggestion) {
				throw new Error(`Command not found: '${currentArg}'. Did you mean '${suggestion}'?`);
			}
			throw new Error(`Command not found: '${currentArg}'`);
		}
	}

	if (!command) {
		throw new Error(`Command not found. Please specify a valid command.`);
	}

	if (!command.action) {
		throw new Error(
			`Command "${command.name}" is a container for sub-commands and has no action. Please specify a sub-command.`,
		);
	}

	const args: Record<string, any> = {};
	const commandArgs = argv.slice(argIndex);

	command.options?.forEach(opt => {
		if (opt.defaultValue !== undefined) {
			const key = opt.name.replace(/^--/, "");
			args[key] = opt.defaultValue;
		}
	});

	for (let i = 0; i < commandArgs.length; i++) {
		const arg = commandArgs[i];
		const option = command.options?.find(
			o => o.name === arg || o.shorthand === arg,
		);

		if (option) {
			const key = option.name.replace(/^--/, "");
			const nextArg = commandArgs[i + 1];

			if (nextArg && !nextArg.startsWith("-")) {
				args[key] = nextArg;
				i++;
			} else {
				args[key] = true;
			}
		}
	}

	command.options?.forEach(opt => {
		const key = opt.name.replace(/^--/, "");
		if (opt.required && args[key] === undefined) {
			throw new Error(`Missing required option: ${opt.name}`);
		}
	});

	return { command, args };
};
