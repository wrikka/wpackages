import type {
	CLICommand,
	CLIConfig,
	CLIRunResult,
	CLITool,
} from "../types/cli.types";

export const createCLITool = (config: CLIConfig): CLITool => {
	let commands: Map<string, CLICommand> = new Map(
		config.commands.map((cmd) => [cmd.name, cmd]),
	);

	const addCommand = (command: CLICommand): void => {
		commands = new Map(commands);
		commands.set(command.name, command);
	};

	const removeCommand = (name: string): void => {
		commands = new Map(commands);
		commands.delete(name);
	};

	const run = async (args: readonly string[]): Promise<CLIRunResult> => {
		const startTime = Date.now();

		try {
			const { command, options } = parse(args);
			const cmd = commands.get(command);

			if (!cmd) {
				return {
					command,
					args: options,
					success: false,
					error: new Error(`Unknown command: ${command}`),
					duration: Date.now() - startTime,
				};
			}

			await cmd.handler(options);

			return {
				command,
				args: options,
				success: true,
				duration: Date.now() - startTime,
			};
		} catch (error) {
			return {
				command: args[0] ?? "unknown",
				args: {},
				success: false,
				error: error instanceof Error ? error : new Error(String(error)),
				duration: Date.now() - startTime,
			};
		}
	};

	const parse = (args: readonly string[]): {
		readonly command: string;
		readonly options: Record<string, unknown>;
	} => {
		const command = args[0] ?? "help";
		const options: Record<string, unknown> = {};

		for (let i = 1; i < args.length; i++) {
			const arg = args[i];

			if (arg.startsWith("--")) {
				const key = arg.slice(2);
				const nextArg = args[i + 1];

				if (nextArg && !nextArg.startsWith("-")) {
					options[key] = nextArg;
					i++;
				} else {
					options[key] = true;
				}
			} else if (arg.startsWith("-")) {
				const key = arg.slice(1);
				const nextArg = args[i + 1];

				if (nextArg && !nextArg.startsWith("-")) {
					options[key] = nextArg;
					i++;
				} else {
					options[key] = true;
				}
			}
		}

		return {
			command,
			options,
		};
	};

	const help = (commandName?: string): string => {
		if (commandName) {
			const cmd = commands.get(commandName);
			if (!cmd) {
				return `Unknown command: ${commandName}`;
			}

			let helpText = `${config.name} ${cmd.name}\n\n`;
			helpText += `${cmd.description}\n\n`;

			if (cmd.options && cmd.options.length > 0) {
				helpText += "Options:\n";
				for (const opt of cmd.options) {
					const alias = opt.alias ? `-${opt.alias}, ` : "";
					helpText += `  ${alias}--${opt.name}\t${opt.description ?? ""}\n`;
				}
			}

			return helpText;
		}

		let helpText = `${config.name} v${config.version}\n\n`;
		helpText += `${config.description ?? ""}\n\n`;
		helpText += "Commands:\n";

		for (const [name, cmd] of commands.entries()) {
			helpText += `  ${name}\t${cmd.description}\n`;
		}

		return helpText;
	};

	return Object.freeze({
		addCommand,
		removeCommand,
		run,
		parse,
		help,
	});
};
