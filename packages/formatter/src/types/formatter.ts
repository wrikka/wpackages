export type FormatterEngine = "auto" | "dprint" | "biome";

export type FormatOptions = {
	engine?: FormatterEngine;
	check?: boolean;
	cwd?: string;
	configPath?: string;
};

export type SpawnResult = {
	stdout: string;
	stderr: string;
	exitCode: number;
};
