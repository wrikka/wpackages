export interface CLICommand {
	readonly name: string;
	readonly description: string;
	readonly aliases?: readonly string[];
	readonly options?: readonly CLIOption[];
	readonly handler: (args: Record<string, unknown>) => Promise<void> | void;
}

export interface CLIOption {
	readonly name: string;
	readonly description?: string;
	readonly alias?: string;
	readonly type: "string" | "number" | "boolean" | "array";
	readonly required?: boolean;
	readonly default?: unknown;
	readonly choices?: readonly string[];
}

export interface CLIConfig {
	readonly name: string;
	readonly version: string;
	readonly description?: string;
	readonly commands: readonly CLICommand[];
	readonly globalOptions?: readonly CLIOption[];
}

export interface CLIRunResult {
	readonly command: string;
	readonly args: Record<string, unknown>;
	readonly success: boolean;
	readonly error?: Error;
	readonly duration: number;
}

export interface CLITool {
	readonly addCommand: (command: CLICommand) => void;
	readonly removeCommand: (name: string) => void;
	readonly run: (args: readonly string[]) => Promise<CLIRunResult>;
	readonly parse: (args: readonly string[]) => {
		readonly command: string;
		readonly options: Record<string, unknown>;
	};
	readonly help: (commandName?: string) => string;
}
