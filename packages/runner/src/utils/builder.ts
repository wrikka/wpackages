import type { Result, RunnerError, RunnerOptions, RunnerResult } from "../types";
import { execute } from "./execute";

/**
 * Command Builder - Fluent API for building commands
 */
export class CommandBuilder {
	private options: Partial<RunnerOptions> = {};

	constructor(command: string, args?: readonly string[]) {
		this.options.command = command;
		if (args) {
			this.options.args = args;
		}
	}

	/**
	 * Add arguments
	 */
	args(...args: readonly string[]): this {
		this.options.args = [...(this.options.args ?? []), ...args];
		return this;
	}

	/**
	 * Set working directory
	 */
	cwd(cwd: string): this {
		this.options.cwd = cwd;
		return this;
	}

	/**
	 * Set environment variables
	 */
	env(env: Record<string, string>): this {
		this.options.env = { ...this.options.env, ...env };
		return this;
	}

	/**
	 * Add single environment variable
	 */
	addEnv(key: string, value: string): this {
		this.options.env = { ...this.options.env, [key]: value };
		return this;
	}

	/**
	 * Set timeout
	 */
	timeout(ms: number): this {
		this.options.timeout = ms;
		return this;
	}

	/**
	 * Use shell
	 */
	shell(shell?: boolean | string): this {
		this.options.shell = shell ?? true;
		return this;
	}

	/**
	 * Set input
	 */
	input(input: string | Buffer): this {
		this.options.input = input;
		return this;
	}

	/**
	 * Enable verbose mode
	 */
	verbose(verbose = true): this {
		this.options.verbose = verbose;
		return this;
	}

	/**
	 * Enable dry run mode
	 */
	dryRun(dryRun = true): this {
		this.options.dryRun = dryRun;
		return this;
	}

	/**
	 * Strip final newline
	 */
	stripFinalNewline(strip = true): this {
		this.options.stripFinalNewline = strip;
		return this;
	}

	/**
	 * Prefer local binaries
	 */
	preferLocal(prefer = true): this {
		this.options.preferLocal = prefer;
		return this;
	}

	/**
	 * Reject on error
	 */
	rejectOnError(reject = true): this {
		this.options.rejectOnError = reject;
		return this;
	}

	/**
	 * Set abort signal
	 */
	signal(signal: AbortSignal): this {
		this.options.signal = signal;
		return this;
	}

	/**
	 * Inherit stdio from parent
	 */
	inheritStdio(inherit = true): this {
		this.options.inheritStdio = inherit;
		return this;
	}

	/**
	 * Get built options
	 */
	build(): RunnerOptions {
		if (!this.options.command) {
			throw new Error("Command is required");
		}
		return { ...this.options } as RunnerOptions;
	}

	/**
	 * Execute the command
	 */
	async run(): Promise<Result<RunnerResult, RunnerError>> {
		return execute(this.build());
	}

	/**
	 * Clone the builder
	 */
	clone(): CommandBuilder {
		if (!this.options.command) {
			throw new Error("Cannot clone a command builder without a command");
		}
		const builder = new CommandBuilder(
			this.options.command,
			this.options.args,
		);
		builder.options = { ...this.options };
		return builder;
	}
}

/**
 * Create a new command builder
 */
export const command = (
	cmd: string,
	...args: readonly string[]
): CommandBuilder => {
	return new CommandBuilder(cmd, args);
};

/**
 * Git command builder
 */
export const git = (...args: readonly string[]): CommandBuilder => {
	return command("git", ...args);
};

/**
 * npm command builder
 */
export const npm = (...args: readonly string[]): CommandBuilder => {
	return command("npm", ...args);
};

/**
 * Docker command builder
 */
export const docker = (...args: readonly string[]): CommandBuilder => {
	return command("docker", ...args);
};

/**
 * Bun command builder
 */
export const bun = (...args: readonly string[]): CommandBuilder => {
	return command("bun", ...args);
};

/**
 * Node command builder
 */
export const node = (...args: readonly string[]): CommandBuilder => {
	return command("node", ...args);
};
