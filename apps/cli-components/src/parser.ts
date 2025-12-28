/**
 * CLI Command Parser
 * Lightweight command-line parser with both sync and Result-based variants
 */

import type { CommandDef, OptionDef, OptionValue, ParsedCLI, ParseError, ProgramDef } from "./types/index";
import { camelCase, parseFlags } from "./utils";

// ===== Result Type for Functional Parser =====

export type ParserResult<E, A> = { _tag: "Success"; value: A } | { _tag: "Failure"; error: E };

const ok = <A, E>(value: A): ParserResult<E, A> => ({ _tag: "Success", value });
const err = <E, A>(error: E): ParserResult<E, A> => ({ _tag: "Failure", error });
const isSuccess = <E, A>(result: ParserResult<E, A>): result is { _tag: "Success"; value: A } =>
	result._tag === "Success";

// ===== Standard Parser (throws on error) =====

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
			return { command: '', options: { help: true } as T, args: [] };
		}

		if (arg === "--version" || arg === "-V") {
			if (command) {
				return { command, options: { version: true } as T, args: [] };
			}
			return { command: '', options: { version: true } as T, args: [] };
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
		return { command: '', options: options as T, args };
};

/**
 * Parse single option
 */
const parseOption = (
	arg: string,
	nextArg: string | undefined,
	options: Record<string, OptionDef>,
): { key?: string; value: unknown } => {
	for (const [key, optDef] of Object.entries(options)) {
		const { short, long } = parseFlags(optDef.flags);

		let matched = false;
		let value: unknown = true;

		// Match --long=value
		if (long && arg.startsWith(`--${long}`)) {
			matched = true;
			if (arg.includes("=")) {
				value = arg.split("=")[1];
			} else if (nextArg && !nextArg.startsWith("-")) {
				value = nextArg;
			}
		} // Match -s
		else if (short && arg === `-${short}`) {
			matched = true;
			if (nextArg && !nextArg.startsWith("-")) {
				value = nextArg;
			}
		}

		if (matched) {
			if (optDef.parse && value !== true) {
				value = optDef.parse(String(value));
			} else if (value !== true && !Number.isNaN(Number(value))) {
				value = Number(value);
			}

			return { key: camelCase(key), value };
		}
	}

	return { value: undefined };
};

/**
 * Execute command
 */
export const executeCommand = async <T = Record<string, OptionValue>>(
	parsed: ParsedCLI<T>,
	program: ProgramDef,
): Promise<void> => {
	if (parsed.command) {
		const cmd = program.commands?.find((c) => c.name === parsed.command);
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

// ===== Functional Parser (with Result type) =====

/**
 * Parse CLI arguments with Result type
 */
export const parseArgsWithResult = <T = Record<string, OptionValue>>(
	argv: readonly string[],
	program: ProgramDef,
): ParserResult<ParseError, ParsedCLI<T>> => {
	let currentResult: {
		options: Record<string, unknown>;
		args: string[];
		command?: string;
	} = {
		args: [],
		options: {},
	};

	let i = 0;
	let commandDef: CommandDef | undefined;

	// Check for command
	if (argv[0] && !argv[0].startsWith("-")) {
		for (const cmd of program.commands || []) {
			if (cmd.name === argv[0] || cmd.aliases?.includes(argv[0])) {
				commandDef = cmd;
				currentResult = { ...currentResult, command: cmd.name };
				i = 1;
				break;
			}
		}

		// Unknown command
		if (
			!commandDef
			&& argv[0]
			&& program.commands
			&& program.commands.length > 0
		) {
			return err<ParseError, ParsedCLI<T>>({
				command: argv[0],
				type: "UNKNOWN_COMMAND",
			});
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
			return ok<ParsedCLI<T>, ParseError>({
				args: [],
				command: currentResult.command,
				options: { help: true } as T,
			});
		}

		if (arg === "--version" || arg === "-V") {
			return ok<ParsedCLI<T>, ParseError>({
				args: [],
				command: currentResult.command,
				options: { version: true } as T,
			});
		}

		if (arg.startsWith("-")) {
			const optionResult = parseOptionWithResult(arg, argv[i + 1], allOptions);

			if (!isSuccess(optionResult)) {
				return optionResult as ParserResult<ParseError, ParsedCLI<T>>;
			}

			const { key, value } = optionResult.value;
			if (key) {
				currentResult = {
					...currentResult,
					options: {
						...currentResult.options,
						[key]: value,
					},
				};

				if (value !== true && argv[i + 1] === String(value)) {
					i++;
				}
			}
		} else {
			currentResult = {
				...currentResult,
				args: [...currentResult.args, arg],
			};
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
			currentResult.options[camelKey] === undefined
			&& optDef.default !== undefined
		) {
			currentResult = {
				...currentResult,
				options: {
					...currentResult.options,
					[camelKey]: optDef.default,
				},
			};
		}
	}

	// Validate required options
	for (
		const [key, optDef] of Object.entries(allOptions) as [
			string,
			OptionDef,
		][]
	) {
		const camelKey = camelCase(key);
		if (optDef.required && currentResult.options[camelKey] === undefined) {
			return err<ParseError, ParsedCLI<T>>({
				option: key,
				type: "MISSING_REQUIRED",
			});
		}
	}

	return ok<ParsedCLI<T>, ParseError>({
		args: currentResult.args,
		command: currentResult.command,
		options: currentResult.options as T,
	});
};

/**
 * Parse single option with Result type
 */
const parseOptionWithResult = (
	arg: string,
	nextArg: string | undefined,
	options: Record<string, OptionDef>,
): ParserResult<ParseError, { key?: string; value: unknown }> => {
	for (const [key, optDef] of Object.entries(options)) {
		const { short, long } = parseFlags(optDef.flags);

		let matched = false;
		let value: unknown = true;

		// Match --long=value
		if (long && arg.startsWith(`--${long}`)) {
			matched = true;
			if (arg.includes("=")) {
				const parts = arg.split("=");
				value = parts[1];
			} else if (nextArg && !nextArg.startsWith("-")) {
				value = nextArg;
			}
		} // Match -s
		else if (short && arg === `-${short}`) {
			matched = true;
			if (nextArg && !nextArg.startsWith("-")) {
				value = nextArg;
			}
		}

		if (matched) {
			// Parse with custom parser (if provided and returns Result)
			if (optDef.parse && value !== true) {
				const parseResult = optDef.parse(String(value));
				if (!isSuccess(parseResult)) {
					return err<ParseError, { key?: string; value: unknown }>({
						option: key,
						type: "INVALID_VALUE",
						value: String(value),
					});
				}
				value = parseResult.value;
			} // Auto-convert to number
			else if (value !== true && !Number.isNaN(Number(value))) {
				value = Number(value);
			}

			// Validate choices
			if (optDef.choices && !optDef.choices.includes(value as never)) {
				return err({
					option: key,
					type: "INVALID_VALUE",
					value: String(value),
				});
			}

			return ok({ key: camelCase(key), value });
		}
	}

	// Unknown option
	if (arg.startsWith("-")) {
		return err({
			option: arg,
			type: "UNKNOWN_OPTION",
		});
	}

	return ok({ value: undefined });
};

/**
 * Execute command with Result type
 */
export const executeCommandWithResult = async <T = Record<string, OptionValue>>(
	parsed: ParsedCLI<T>,
	program: ProgramDef,
): Promise<ParserResult<string, void>> => {
	if (parsed.command) {
		const cmd = program.commands?.find((c) => c.name === parsed.command);
		if (cmd) {
			return await cmd.action(
				parsed.options as Record<string, OptionValue>,
				parsed.args,
			);
		}
		return err(`Command "${parsed.command}" not found`);
	}

	if (program.defaultAction) {
		return await program.defaultAction(
			parsed.options as Record<string, OptionValue>,
			parsed.args,
		);
	}

	return ok(undefined);
};
