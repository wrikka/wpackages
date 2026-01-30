import type { CommandDef, OptionDef, OptionValue, ParsedCLI, ProgramDef } from "../types/index";
import { camelCase } from "../utils";
import { autoCoerceValue, matchOptionArg, parseOptionFlags } from "./helpers";

/**
 * Parse single option
 */
const parseOption = (
	arg: string,
	nextArg: string | undefined,
	options: Record<string, OptionDef>,
): { key?: string; value: unknown } => {
	for (const [key, optDef] of Object.entries(options)) {
		const { short, long } = parseOptionFlags(optDef.flags);
		const { matched, rawValue } = matchOptionArg(arg, nextArg, { long, short });
		if (!matched) continue;

		let value: unknown = rawValue;
		if (optDef.parse && value !== true) {
			const parseResult = optDef.parse(String(value));
			if (parseResult._tag === "Failure") {
				throw new Error(`Invalid value for option "${key}": ${parseResult.error}`);
			}
			value = parseResult.value;
		} else {
			value = autoCoerceValue(value);
		}

		return { key: camelCase(key), value };
	}

	return { value: undefined };
};

/**
 * Parse CLI arguments
 */
export const parseArgs = <T = Record<string, OptionValue>>(
	argv: string[],
	program: ProgramDef,
): ParsedCLI<T> => {
	let command: string | undefined;
	const options: Record<string, unknown> = {};
	const args: string[] = [];

	let i = 0;
	let commandDef: CommandDef | undefined;

	// Check for command
	if (argv[0] && !argv[0].startsWith("-")) {
		for (const cmd of program.commands || []) {
			if (cmd.name === argv[0] || cmd.aliases?.includes(argv[0])) {
				commandDef = cmd;
				command = cmd.name;
				i = 1;
				break;
			}
		}
	}

	// Merge options
	const allOptions = {
		...program.options,
		...commandDef?.options,
	};

	// Parse
	while (i < argv.length) {
		const arg = argv[i];
		if (!arg) break;

		if (arg === "--help" || arg === "-h") {
			if (command) {
				return { command, options: { help: true } as T, args: [] };
			}
			return { command: "", options: { help: true } as T, args: [] };
		}

		if (arg === "--version" || arg === "-V") {
			if (command) {
				return { command, options: { version: true } as T, args: [] };
			}
			return { command: "", options: { version: true } as T, args: [] };
		}

		if (arg.startsWith("-")) {
			const { key, value } = parseOption(arg, argv[i + 1], allOptions);
			if (key) {
				options[key] = value;
				if (value !== true && argv[i + 1] === String(value)) {
					i++;
				}
			}
		} else {
			args.push(arg);
		}

		i++;
	}

	// Apply defaults
	for (
		const [key, optDef] of Object.entries(allOptions) as [
			string,
			OptionDef,
		][]
	) {
		const camelKey = camelCase(key);
		if (
			options[camelKey] === undefined
			&& optDef.default !== undefined
		) {
			options[camelKey] = optDef.default;
		}
	}

	if (command) {
		return { command, options: options as T, args };
	}
	return { command: "", options: options as T, args };
};

/**
 * Execute command
 */
export const executeCommand = async <T = Record<string, OptionValue>>(
	parsed: ParsedCLI<T>,
	program: ProgramDef,
): Promise<void> => {
	if (parsed.command) {
		const cmd = program.commands?.find((c: CommandDef) => c.name === parsed.command);
		if (cmd) {
			await cmd.action(
				parsed.options as Record<string, OptionValue>,
				parsed.args as readonly string[],
			);
		}
	} else if (program.defaultAction) {
		await program.defaultAction(
			parsed.options as Record<string, OptionValue>,
			parsed.args as readonly string[],
		);
	}
};
