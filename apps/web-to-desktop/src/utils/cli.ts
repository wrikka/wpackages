/**
 * Pure CLI utilities
 */

export const CANCEL = Symbol("CANCEL");

export type PromptValue = string | number | boolean | typeof CANCEL;

interface Question {
	name: string;
	type: string;
	message: string;
	placeholder?: string;
	default?: unknown;
	validate?: (v: unknown) => boolean | string;
}

/**
 * Simple prompts builder
 */
export function prompts() {
	const questions: Question[] = [];

	return {
		text(name: string, options: {
			message: string;
			placeholder?: string | undefined;
			validate?: (v: string) => boolean | string;
		}) {
			questions.push({
				name,
				type: "text",
				message: options.message,
				placeholder: options.placeholder || '',
				validate: (v: unknown) => options.validate?.(v as string) ?? true,
			});
			return this;
		},

		number(name: string, options: {
			message: string;
			default?: number;
			validate?: (v: number) => boolean | string;
		}) {
			questions.push({
				name,
				type: "number",
				message: options.message,
				default: options.default,
				validate: (v: unknown) => options.validate?.(v as number) ?? true,
			});
			return this;
		},

		confirm(name: string, options: {
			message: string;
			default?: boolean;
		}) {
			questions.push({
				name,
				type: "confirm",
				message: options.message,
				default: options.default,
			});
			return this;
		},

		async run(): Promise<Record<string, unknown> | typeof CANCEL> {
			const readline = await import("node:readline");
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			const result: Record<string, unknown> = {};

			for (const question of questions) {
				const answer = await new Promise<string>((resolve) => {
					const prompt = question.default !== undefined
						? `${question.message} [${String(question.default)}] `
						: `${question.message} `;
					rl.question(prompt, resolve);
				});

				const value = answer || String(question.default);

				if (question.type === "number") {
					result[question.name] = parseInt(value, 10);
				} else if (question.type === "confirm") {
					result[question.name] = value.toLowerCase() === "y" || value.toLowerCase() === "yes";
				} else {
					result[question.name] = value;
				}

				if (question.validate) {
					const validation = question.validate(result[question.name]);
					if (validation !== true) {
						console.log(`Error: ${validation}`);
						rl.close();
						return CANCEL;
					}
				}
			}

			rl.close();
			return result;
		},
	};
}

/**
 * Simple CLI builder
 */
export function createCLI(options: {
	name: string;
	version: string;
	description: string;
}) {
	const commands: Map<string, {
		name: string;
		description: string;
		action: (...args: unknown[]) => Promise<void>;
		aliases?: string[];
	}> = new Map();

	let defaultAction: ((...args: unknown[]) => Promise<void>) | null = null;

	return {
		command(config: {
			name: string;
			description: string;
			action: (...args: unknown[]) => Promise<void>;
			aliases?: string[] | undefined;
			arguments?: unknown[];
			options?: unknown;
			examples?: string[];
		}) {
			commands.set(config.name, {
				name: config.name,
				description: config.description,
				action: config.action,
				aliases: config.aliases || [],
			});
		},

		action(fn: (...args: unknown[]) => Promise<void>) {
			defaultAction = fn;
		},

		async run() {
			const args = process.argv.slice(2);
			const commandName = args[0];

			if (!commandName || commandName === "--help" || commandName === "-h") {
				console.log(`${options.name} v${options.version}`);
				console.log(options.description);
				console.log("\nCommands:");
				for (const [, cmd] of commands) {
					console.log(`  ${cmd.name} - ${cmd.description}`);
				}
				return;
			}

			const command = commands.get(commandName);
			if (command) {
				await command.action();
			} else if (defaultAction) {
				await defaultAction();
			} else {
				console.error(`Unknown command: ${commandName}`);
				process.exit(1);
			}
		},
	};
}
