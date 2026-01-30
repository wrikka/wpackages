export type FormatterEngine = "auto" | "dprint" | "biome";

export type FormatOptions = {
	readonly engine?: FormatterEngine;
	readonly check?: boolean;
	readonly cwd?: string;
	readonly configPath?: string;
	readonly paths?: readonly string[];
};

export type SpawnResult = {
	readonly stdout: string;
	readonly stderr: string;
	readonly exitCode: number;
};

export type FormatResult = {
	readonly stdout: string;
	readonly stderr: string;
	readonly filesFormatted: number;
	readonly filesChecked: number;
};

export class ProcessError extends Error {
	constructor(
		message: string,
		public readonly stdout: string,
		public readonly stderr: string,
		public readonly exitCode: number,
	) {
		super(message);
		this.name = "ProcessError";
	}
}
