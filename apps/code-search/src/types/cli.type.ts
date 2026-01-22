export type OutputMode = "text" | "json";

export type LangKey = "typescript" | "tsx" | "javascript";

export type CliOptions = {
	paths: string[];
	lang: LangKey;
	nodeType?: string;
	pattern?: string;
	rule?: string;
	output: OutputMode;
	countOnly: boolean;
	replace: string | undefined;
	write: boolean;
	check: boolean;
};

export type MatchRecord = {
	file: string;
	type: string;
	start?: number;
	end?: number;
	text?: string;
};
