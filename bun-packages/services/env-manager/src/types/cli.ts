export type OutputFormat = "json" | "dotenv";

export type CliOptions = {
	paths: string[];
	environment?: string;
	expand: boolean;
	override: boolean;
	output: OutputFormat;
	schema?: string;
	validate?: boolean;
	generateExample?: boolean;
	exampleOutput?: string;
	encrypt?: string;
	decrypt?: string;
	audit?: boolean;
	diff?: string;
	merge?: string;
	template?: string;
	templateList?: boolean;
	templateSave?: string;
	templateDelete?: string;
	generateTypes?: string;
	completion?: "bash" | "zsh" | "fish" | "powershell";
	migrate?: "up" | "down" | "status";
	migrateTarget?: string;
	lock?: boolean;
	lockCheck?: boolean;
	web?: boolean;
};
