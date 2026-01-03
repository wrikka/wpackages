export type OutputFormat = "json" | "dotenv";

export type CliOptions = {
	paths: string[];
	environment?: string;
	expand: boolean;
	override: boolean;
	output: OutputFormat;
};
