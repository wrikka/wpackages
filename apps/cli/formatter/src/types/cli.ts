import type { FormatterEngine } from "./formatter";

export type CliArgs = {
	readonly check?: boolean;
	readonly engine?: FormatterEngine;
	readonly cwd?: string;
	readonly config?: string;
	readonly paths?: readonly string[];
};

export type CliConfig = {
	readonly name: string;
	readonly version: string;
	readonly description: string;
};
